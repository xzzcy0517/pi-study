process.env.PI_CODING_AGENT = "true";
process.env.AI_AGENT = "pi";

import { spawn } from "node:child_process";

const child = spawn(process.execPath, ["-e", "console.log('子进程看到 AI_AGENT:', process.env.AI_AGENT)"], {
	stdio: "inherit",
});
