import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const tmp = join(__dirname, "tmp-project");

// 建一个临时项目结构：tmp-project/package.json 和 tmp-project/dist/bundle/
rmSync(tmp, { recursive: true, force: true });
mkdirSync(join(tmp, "dist", "bundle"), { recursive: true });
writeFileSync(join(tmp, "package.json"), '{"name":"root"}');
writeFileSync(join(tmp, "dist", "package.json"), '{"name":"dist-meta"}');

// 动态导入 config.ts 的 findNodePackageDir（从源码）
const { findNodePackageDir } = await import("/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/config.ts");

console.log("从 dist/bundle 找:", findNodePackageDir(join(tmp, "dist", "bundle")));
console.log("（正确结果是 root，不是 dist）");

rmSync(tmp, { recursive: true, force: true });
