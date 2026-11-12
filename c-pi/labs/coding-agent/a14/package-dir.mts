import {
	getPackageDir,
	findNodePackageDir,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/config.ts";

console.log("包根目录:", getPackageDir());
console.log("从 src 向上找:", findNodePackageDir("/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src"));
