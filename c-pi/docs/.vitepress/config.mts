import { defineConfig } from "vitepress";

export default defineConfig({
	lang: "zh-CN",
	title: "Pi 学习笔记",
	description: "从零拆解 earendil-works/pi：最小粒度逐步重新搭建",
	themeConfig: {
		nav: [{ text: "首页", link: "/" }],
		sidebar: [
			{
				text: "第一部分 · 先跑起来",
				items: [{ text: "01 运行 Pi 原始仓库", link: "/01-run-pi" }],
			},
			{
				text: "第二部分 · 看懂启动",
				items: [{ text: "02 执行 ./pi-test.sh 之后，发生了什么（先看大概）", link: "/02-run-to-ui" }],
			},
		],
		outline: { label: "本页目录" },
		docFooter: { prev: "上一篇", next: "下一篇" },
		search: { provider: "local" },
	},
});
