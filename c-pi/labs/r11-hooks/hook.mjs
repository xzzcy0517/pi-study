// 迷你前台：把假包名 @fake/greeter 指到本地真文件
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";

registerHooks({
	resolve(specifier, context, nextResolve) {
		if (specifier === "@fake/greeter") {
			console.error("[前台] 截到一笔:", specifier);
			return {
				url: pathToFileURL(
					"/Users/admin/Desktop/pi-study/c-pi/labs/r11-hooks/greeter.mjs",
				).href,
				shortCircuit: true,
			};
		}
		console.error("[前台] 不认识", JSON.stringify(specifier), "，交给 node 默认流程");
		return nextResolve(specifier, context);
	},
});
