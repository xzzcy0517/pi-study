import { formatHttpIdleTimeoutMs } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/core/http-dispatcher.ts";

for (const ms of [0, 30_000, 60_000, 120_000, 300_000, 1500]) {
	console.log(ms, "ms =>", formatHttpIdleTimeoutMs(ms));
}
