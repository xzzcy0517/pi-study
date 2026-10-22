import { defineConfig } from "vitepress";

export default defineConfig({
	lang: "zh-CN",
	title: "pi-test.sh 陪读教程",
	description: "零基础的 shell 第一课：跟着示例，一段一段读懂 pi/pi-test.sh 和它加载的 source-resolver.ts",
	themeConfig: {
		nav: [{ text: "首页", link: "/" }],
		sidebar: [
			{
				text: "第一季 · pi-test.sh 陪读",
				items: [
					{ text: "第 1 讲 · 开头两行", link: "/r1-shebang-strict" },
					{ text: "第 2 讲 · 找到自己的家", link: "/r2-find-my-home" },
					{ text: "第 3 讲 · 收参数与分拣", link: "/r3-collect-args" },
					{ text: "第 4 讲 · --no-env 与环境变量", link: "/r4-no-env" },
					{ text: "第 5 讲 · 把地址翻译成网址", link: "/r5-path-to-url" },
					{ text: "第 6 讲 · 点火发射", link: "/r6-launch" },
					{ text: "第 7 讲 · 毕业总结", link: "/r7-summary" },
				],
			},
			{
				text: "第二季 · source-resolver.ts 陪读",
				items: [
					{ text: "第 8 讲 · 翻译官登场", link: "/r8-why-resolver" },
					{ text: "第 9 讲 · 两张说明书与找花名册", link: "/r9-tsconfig-paths" },
					{ text: "第 10 讲 · 加工成翻译卡片", link: "/r10-alias-cards" },
					{ text: "第 11 讲 · registerHooks 设前台", link: "/r11-register-hooks" },
					{ text: "第 12 讲 · 两个帮手函数", link: "/r12-helpers" },
					{ text: "第 13 讲 · 毕业总结：围观翻译官", link: "/r13-resolver-summary" },
				],
			},
		],
		outline: { label: "本页目录" },
		docFooter: { prev: "上一讲", next: "下一讲" },
		search: { provider: "local" },
	},
});
