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
