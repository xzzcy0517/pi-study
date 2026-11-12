# 第 23 讲 · 安装被换掉了怎么办

> **对应源码**：`pi/packages/coding-agent/src/config.ts:554-575`

---

## 一句话

Pi 可能一边运行、一边被另一个终端更新。`detectInstallChange()` 检查“启动时读到的 `package.json`”现在是否变了：版本更新了，还是整个安装被删了。

## 问题场景

```text
终端 A：Pi 正在交互界面里跑着
终端 B：用户执行了 pi update
        ↓
磁盘上的安装目录被替换或删除
        ↓
终端 A 里，某些“用到才加载”的功能突然找不到文件
```

这不是假设，源码注释里标了 issue #10439。所以 Pi 需要一个检查手段。

## 源码

```ts
export type InstallChange = { kind: "updated"; version: string } | { kind: "removed" };

export function detectInstallChange(packageJsonPath = startupPackageJsonPath): InstallChange | undefined {
	// The Bun binary embeds its code, so replacing the executable does not affect this process.
	if (isBunBinary || !packageJsonPath) return undefined;
	let installed: PackageJson;
	try {
		installed = JSON.parse(stripBom(readFileSync(packageJsonPath, "utf-8"))) as PackageJson;
	} catch (error) {
		return (error as NodeJS.ErrnoException).code === "ENOENT" ? { kind: "removed" } : undefined;
	}
	return installed.version && installed.version !== VERSION
		? { kind: "updated", version: installed.version }
		: undefined;
}
```

## 返回值只有三种

| 返回值 | 含义 |
|---|---|
| `{ kind: "updated", version: "1.5.1" }` | 磁盘上换成了另一个版本 |
| `{ kind: "removed" }` | 启动时那个 `package.json` 不见了 |
| `undefined` | 没变化，或者无法判断 |

## 逐块解释

### 先排除 Bun 二进制

```ts
if (isBunBinary || !packageJsonPath) return undefined;
```

Bun 编译二进制把代码嵌在可执行文件里，不依赖安装目录里的按需文件。所以替换可执行文件不影响当前进程，不用报警。

`!packageJsonPath` 表示启动时就没读到 `package.json`，没有比较基准。

### 读启动时记录的路径

```ts
installed = JSON.parse(stripBom(readFileSync(packageJsonPath, "utf-8"))) as PackageJson;
```

注意默认参数：

```ts
packageJsonPath = startupPackageJsonPath
```

`startupPackageJsonPath` 是模块加载时读取 `package.json` 后记下来的路径。这里**直接复用**，不会重新向上查找。

为什么？源码注释解释：如果安装被删除，重新向上查找可能找到主目录里一个毫不相关的 `package.json`，得出错误结论。

### 区分“删除”和“其他错误”

```ts
return (error as NodeJS.ErrnoException).code === "ENOENT" ? { kind: "removed" } : undefined;
```

- `ENOENT`：明确是文件不存在 → 报告安装被删除；
- JSON 损坏、权限不足等 → 返回 `undefined`（无法判断，不乱报警）。

### 比较版本

```ts
return installed.version && installed.version !== VERSION
	? { kind: "updated", version: installed.version }
	: undefined;
```

`VERSION` 是启动时从同一个文件读到的版本。现在磁盘上的版本和它不同，就报告更新。

## 谁在调用它

调用点有两处：

| 位置 | 用途 |
|---|---|
| `package-manager-cli.ts:760` | 自更新命令执行完后，验证是否真的更新成功 |
| `interactive-mode.ts:2306` | 交互模式出错后，检查是不是安装被换掉了 |

第二处的逻辑很实用：

```ts
const change = detectInstallChange();
if (!change) return false;
// 显示警告：Pi 在本次会话运行期间被更新/删除了
// 建议重启，否则按需加载的功能可能失败
```

这样一来，用户看到的不是莫名其妙的“模块找不到”，而是一条明确的“安装变了，请重启”。

## 动手跑：四种情况

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a23

cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a23/install-change.mts <<'EOF'
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	VERSION,
	detectInstallChange,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/config.ts";

const dir = "/tmp/pi-install-change";
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
const pkgPath = join(dir, "package.json");

// ① 磁盘上是另一个版本
writeFileSync(pkgPath, JSON.stringify({ version: "9.9.9" }));
console.log("① 版本不同:", detectInstallChange(pkgPath));

// ② 版本和启动时一致
writeFileSync(pkgPath, JSON.stringify({ version: VERSION }));
console.log("② 版本相同:", detectInstallChange(pkgPath));

// ③ 文件坏了
writeFileSync(pkgPath, "{ 这不是合法 JSON");
console.log("③ JSON 坏了:", detectInstallChange(pkgPath));

// ④ 文件被删
rmSync(pkgPath);
console.log("④ 文件被删:", detectInstallChange(pkgPath));

rmSync(dir, { recursive: true, force: true });
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a23/install-change.mts
```

**预期输出**：

```text
① 版本不同: { kind: 'updated', version: '9.9.9' }
② 版本相同: undefined
③ JSON 坏了: undefined
④ 文件被删: { kind: 'removed' }
```

## 观察点

1. 版本不同 → 报告新版本号；
2. 版本相同 → `undefined`，不打扰用户；
3. JSON 坏了 → `undefined`，不误报“被删除”；
4. 文件不存在 → 明确报告 `removed`。

## 它不是“文件监视器”

`detectInstallChange()` 不会持续监听磁盘。它只是**在你调用它的那一刻**读一次文件、比一下版本。

所以调用点选择很重要：在自更新之后、在出错之后调用，才能捕捉到有意义的变化。

## 小结

- `detectInstallChange()` 比较启动时的 `package.json` 和现在的磁盘状态；
- 三种结果：更新、删除、无变化/无法判断；
- 只认 `ENOENT` 为“删除”，其他错误不乱报；
- 复用启动时记录的路径，避免删除后找到无关的 `package.json`；
- 不会主动监视，只在调用时检查一次。

## 下一讲预告

`config.ts` 的最后一块：用户配置目录 `~/.pi/agent` 下面都有哪些文件。

---

## 自测

1. `detectInstallChange()` 三种返回值分别是什么？
2. 为什么删除安装后不重新向上找 `package.json`？
3. JSON 解析失败会报告“删除”吗？为什么？
4. 为什么 Bun 二进制不需要这个检查？
