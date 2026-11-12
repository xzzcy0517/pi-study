import { EventEmitter } from "node:events";

// 情况 1：没有 error 监听器
const emitter1 = new EventEmitter();
try {
	emitter1.emit("error", new Error("没人听我就炸"));
	console.log("情况 1：没炸");
} catch (err) {
	console.log("情况 1：捕获到错误 =", err.message);
}

// 情况 2：有一个空 error 监听器
const emitter2 = new EventEmitter();
emitter2.on("error", () => {});
emitter2.emit("error", new Error("有人听我就不炸"));
console.log("情况 2：没炸");
