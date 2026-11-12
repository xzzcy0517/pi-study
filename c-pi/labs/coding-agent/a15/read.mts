import { readFileSync } from "node:fs";
import { stripBom } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/utils/text.ts";

const path = "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/package.json";
const content = readFileSync(path, "utf-8");
const pkg = JSON.parse(stripBom(content));

console.log("name:", pkg.name);
console.log("version:", pkg.version);
console.log("piConfig:", pkg.piConfig);
