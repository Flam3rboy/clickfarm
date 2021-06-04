import fs from "fs";
const exitHook = require("async-exit-hook");

Array.prototype.remove = function <T>(this: T[], elem: T): T[] {
	// do not use filter to modify current array
	const index = this.indexOf(elem);
	if (index === -1) return this;

	this.splice(index, 1);
	return this; //.filter((e) => e !== elem);
};

Array.prototype.insert = function <T>(i: number, elem: T) {
	return this.splice(i, 0, elem);
};

Array.prototype.flat = function () {
	return this.reduce((acc, val) => (Array.isArray(val) ? acc.concat(val.flat()) : acc.concat(val)), []);
};

Array.prototype.last = function () {
	return this[this.length - 1];
};

Array.prototype.first = function () {
	return this[0];
};

Array.prototype.unique = function () {
	return [...new Set(this)];
};

Array.prototype.random = function () {
	return this[Math.floor(Math.random() * this.length)];
};

Array.prototype.shuffle = function () {
	for (let i = this.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[this[i], this[j]] = [this[j], this[i]];
	}
	return this;
};

const oldCatch = Promise.prototype.catch;
// @ts-ignore
Promise.prototype.catch = function (func?: Function) {
	if (!func) func = console.error;
	// @ts-ignore
	return oldCatch.call(this, func);
};

declare global {
	interface Array<T> {
		remove(o: T): Array<T>;
		flat(): T;
		first(): T;
		last(): T;
		random(): T;
		unique(): T[];
		shuffle(): T[];
		insert(i: number, elem: T): T[];
	}
}

export function init() {} // needed to actually import the file to circumenvent typescript optimizations

export function objectAsBase64(e: any) {
	return <string>Buffer.from(JSON.stringify(e)).toString("base64");
}

export async function sleep(ms: number) {
	return new Promise((res) => setTimeout(res, ms));
}

export async function sleepRandom(min: number, max: number) {
	return new Promise((res) => setTimeout(res, Math.random() * (max - min) + min));
}

const tempdirs: string[] = [];

exitHook(async (callback: any) => {
	const promises = tempdirs.map(async (path) => await fs.promises.rmdir(path, { recursive: true }));
	await Promise.all(promises);
	console.log("cleaned up");
	callback();
});

export async function tempDir() {
	let tempPath: string;

	switch (process.platform) {
		case "darwin":
			tempPath = process.env["TMPDIR"] || "/tmp/nodetemp";
			break;
		case "linux":
			tempPath = "/tmp/nodetemp";
			break;
		case "win32":
			tempPath = "%Temp%\\nodetemp";
			break;
		default:
			tempPath = __dirname;
	}

	let result = await fs.promises.mkdtemp(tempPath);
	tempdirs.push(result);
	return result;
}

export function makeid(length: number) {
	var result = "";
	var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

const useragents = fs.readFileSync(__dirname + "/../../assets/Lists/user_agents.txt", { encoding: "utf8" }).split("\n");

export function randomUserAgent() {
	return <string>useragents.random();
}

const avatars = fs.readFileSync(__dirname + "/../../assets/Lists/avatars.txt", { encoding: "utf8" }).split("\n");

export function randomAvatar() {
	return <string>avatars.random();
}

const usernames = fs.readFileSync(__dirname + "/../../assets/Lists/usernames.txt", { encoding: "utf8" }).split("\n");

export function randomUsername() {
	return <string>usernames.random();
}
