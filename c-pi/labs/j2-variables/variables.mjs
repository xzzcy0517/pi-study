const name = "翻译官";
let count = 1;
count = 2; // let 的东西可以换人
console.log(name, "第", count, "次值班");

// const 锁住的是「指向」，屋子里的家具可以换
const card = { pattern: "@earendil-works/pi-ai" };
card.pattern = "@earendil-works/pi-tui";
console.log("卡片内容被改成了:", card.pattern);
