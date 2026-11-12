import { EventEmitter } from "node:events";

const ignoreError = (_error: unknown) => {};

function withErrorListener(obj: EventEmitter) {
	if (obj instanceof EventEmitter) {
		EventEmitter.prototype.on.call(obj, "error", ignoreError);
	}
	return obj;
}

const emitter = new EventEmitter();
withErrorListener(emitter);

emitter.emit("error", new Error("Pi 风格的忽略"));
console.log("进程没崩");
