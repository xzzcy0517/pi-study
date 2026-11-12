import { getPackageDir } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/config.ts";

process.env.PI_PACKAGE_DIR = "/tmp/pi-override";
console.log("覆盖后包根:", getPackageDir());
