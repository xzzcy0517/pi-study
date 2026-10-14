import { defineConfig } from "vitepress";

export default defineConfig({
	lang: "zh-CN",
	title: "pi-test.sh 陪读教程",
	description: "零基础的 shell 第一课：跟着示例，一段一段读懂 pi/pi-test.sh",
	themeConfig: {
		nav: [{ text: "首页", link: "/" }],
		sidebar: [
			{
				text: "pi-test.sh 陪读教程",
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
		],
		outline: { label: "本页目录" },
		docFooter: { prev: "上一讲", next: "下一讲" },
		search: { provider: "local" },
	},
});
