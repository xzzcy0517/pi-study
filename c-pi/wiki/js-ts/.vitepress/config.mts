import { defineConfig } from "vitepress";

export default defineConfig({
	lang: "zh-CN",
	title: "JS/TS 语法扫盲",
	description: "零基础的语法急救站：source-resolver.ts 与 tsconfig.json 用到的每一个符号，都讲清楚",
	themeConfig: {
		nav: [{ text: "首页", link: "/" }],
		sidebar: [
			{
				text: "JS/TS 语法扫盲",
				items: [
					{ text: "第 1 讲 · 先认识四种「语言」", link: "/j1-four-languages" },
					{ text: "第 2 讲 · 变量与常量", link: "/j2-variables" },
					{ text: "第 3 讲 · 字符串与模板字符串", link: "/j3-strings" },
					{ text: "第 4 讲 · 对象与数组", link: "/j4-objects-arrays" },
					{ text: "第 5 讲 · 函数与箭头函数", link: "/j5-functions" },
					{ text: "第 6 讲 · 判断与逻辑符号", link: "/j6-logic" },
					{ text: "第 7 讲 · 循环与出错处理", link: "/j7-loops-errors" },
					{ text: "第 8 讲 · TypeScript 加的那层料", link: "/j8-typescript" },
					{ text: "第 9 讲 · JSON 与 tsconfig.json", link: "/j9-json-tsconfig" },
					{ text: "第 10 讲 · tsconfig.base.json 逐条", link: "/j10-tsconfig-base" },
					{ text: "第 11 讲 · tsconfig.json 逐条", link: "/j11-tsconfig-root" },
					{ text: "第 12 讲 · 毕业：符号速查表", link: "/j12-cheatsheet" },
				],
			},
		],
		outline: { label: "本页目录" },
		docFooter: { prev: "上一讲", next: "下一讲" },
		search: { provider: "local" },
	},
});
