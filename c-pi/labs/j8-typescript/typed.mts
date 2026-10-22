// TypeScript 加料演练（注意后缀是 .mts）
interface Card {
	readonly pattern: string; // readonly：这个格子只许看
	note?: string; // ?：这个格子可以有、可以没有
}

const card: Card = { pattern: "@earendil-works/pi-ai" };

// 参数和返回值都可以标明类型
function greet(name: string): string {
	return `你好，${name}`;
}

console.log(greet(card.pattern));
console.log("note 格子没填:", card.note); // undefined

// 联合类型：string | undefined = 「要么是字符串，要么是 undefined」
let matched: string | undefined;
matched = "@earendil-works/pi-ai/*";
console.log("matched:", matched);
