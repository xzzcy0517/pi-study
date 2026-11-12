import { defineConfig } from "vitepress";

export default defineConfig({
	lang: "zh-CN",
	title: "coding-agent 入口陪读",
	description: "从零开始读懂 packages/coding-agent/src/cli.ts 的 setupCli() 分支：每讲一小段，每讲都能动手跑",
	themeConfig: {
		nav: [{ text: "首页", link: "/" }],
		sidebar: [
			{
				text: "第 0 章 · 认识要读的文件",
				items: [
					{ text: "第 0 讲 · 这七章代码是什么关系", link: "/a00-what-we-read" },
					{ text: "第 1 讲 · 导入时执行 vs 调用时执行", link: "/a01-import-vs-call" },
				],
			},
			{
				text: "第 1 章 · 入口 cli.ts",
				items: [
					{ text: "第 2 讲 · cli.ts 只有 6 行", link: "/a02-cli-6-lines" },
					{ text: "第 3 讲 · process.argv.slice(2) 是什么意思", link: "/a03-argv-slice" },
				],
			},
			{
				text: "第 2 章 · setupCli() 五步准备",
				items: [
					{ text: "第 4 讲 · setupCli() 概览", link: "/a04-setup-overview" },
					{ text: "第 5 讲 · process.title 与 APP_NAME", link: "/a05-process-title" },
					{ text: "第 6 讲 · 两个环境变量", link: "/a06-env-vars" },
					{ text: "第 7 讲 · 为什么屏蔽 process.emitWarning", link: "/a07-emit-warning" },
					{ text: "第 8 讲 · 配置 HTTP 总管", link: "/a08-configure-http-dispatcher" },
				],
			},
			{
				text: "第 3 章 · HTTP 总管",
				items: [
					{ text: "第 9 讲 · 5 分钟空闲超时", link: "/a09-idle-timeout" },
					{ text: "第 10 讲 · HTTP_PROXY 与代理", link: "/a10-proxy-settings" },
					{ text: "第 11 讲 · 错误监听器", link: "/a11-error-listener" },
					{ text: "第 12 讲 · Client、Pool 与全局 dispatcher", link: "/a12-client-pool-global" },
				],
			},
			{
				text: "第 4 章 · config.ts 配置中心",
				items: [
					{ text: "第 13 讲 · 判断运行形态", link: "/a13-runtime-detection" },
					{ text: "第 14 讲 · 找到包根目录", link: "/a14-find-package-dir" },
					{ text: "第 15 讲 · 读取 package.json", link: "/a15-read-package-json" },
					{ text: "第 16 讲 · APP_NAME 为什么是 \"pi\"", link: "/a16-constants" },
				],
			},
			{
				text: "第 5 章 · 自更新",
				items: [
					{ text: "第 17 讲 · 识别安装方式", link: "/a17-install-method" },
					{ text: "第 18 讲 · 构造自更新命令", link: "/a18-command-shape" },
					{ text: "第 19 讲 · 三道安全门", link: "/a19-three-gates" },
					{ text: "第 20 讲 · 用户自定义更新命令", link: "/a20-custom-update-command" },
				],
			},
			{
				text: "第 6 章 · 资源与用户路径",
				items: [
					{ text: "第 21 讲 · 内置资源路径", link: "/a21-resource-paths" },
					{ text: "第 22 讲 · QuickJS Wasm 与 worker", link: "/a22-special-resources" },
					{ text: "第 23 讲 · 安装被换掉了怎么办", link: "/a23-install-change" },
					{ text: "第 24 讲 · 用户配置路径 ~/.pi/agent", link: "/a24-user-paths" },
				],
			},
			{
				text: "第 7 章 · 子进程",
				items: [
					{ text: "第 25 讲 · 启动子进程", link: "/a25-spawn-process" },
					{ text: "第 26 讲 · 等待子进程结束", link: "/a26-wait-child-process" },
				],
			},
			{
				text: "第 8 章 · 路径与文本工具",
				items: [
					{ text: "第 27 讲 · 路径比较", link: "/a27-path-comparison" },
					{ text: "第 28 讲 · 规范化与解析", link: "/a28-normalize-resolve" },
					{ text: "第 29 讲 · 来源判断、指纹、云同步", link: "/a29-path-misc" },
					{ text: "第 30 讲 · 去掉 JSON 开头的 BOM", link: "/a30-text-bom" },
				],
			},
			{
				text: "第 9 章 · 收尾",
				items: [{ text: "第 31 讲 · 毕业总结", link: "/a31-graduation" }],
			},
		],
		outline: { label: "本页目录" },
		docFooter: { prev: "上一讲", next: "下一讲" },
		search: { provider: "local" },
	},
});
