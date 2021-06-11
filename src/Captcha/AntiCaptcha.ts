// @ts-ignore
process.binding("http_parser").HTTPParser = require("./http-parser").HTTPParser;
import { CaptchaProvider } from "./CaptchaProvider";
const ac = require("@antiadmin/anticaptchaofficial");
import { request } from "https";
import { sleep } from "../util/Util";
import { isNumber } from "util";

export function promiseRequest(url: string, opts: any): Promise<any> {
	return new Promise((resolve, reject) => {
		if (!opts) opts = {};
		if (!opts.headers) opts.headers = {};
		if (typeof opts.body === "object") opts.body = JSON.stringify(opts.body);
		opts.headers["Content-Length"] = Buffer.byteLength(opts.body);

		const req = request(url, opts, function (res) {
			res.setEncoding("utf8");
			let s = "";
			res.on("data", function (chunk) {
				s += chunk;
			});
			res.on("end", () => {
				resolve(JSON.parse(s));
			});
			res.on("error", (e) => {
				reject(e);
			});
		});

		if (opts.body) {
			req.write(opts.body);
			req.end();
		}
	});
}

export class AntiCaptcha extends CaptchaProvider {
	host = "https://api.anti-captcha.com";

	constructor(public key: string) {
		super();
		this.service = "anti-captcha";
	}

	async getBalance() {
		const result = await promiseRequest(`${this.host}/getBalance`, {
			method: "POST",
			body: {
				clientKey: this.key,
			},
		});
		if (result.errorId) throw result.errorDescription || result.errorCode;
		this.balance = Number(result.balance);
		return this.balance;
	}

	async solve(opts: { timeout?: number; agent?: any; task?: any; websiteURL: string; websiteKey: string }) {
		const createTask = await promiseRequest(`${this.host}/createTask`, {
			headers: {
				accept: "application/json, text/javascript, */*; q=0.01",
				"accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
				"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "cross-site",
				"User-Agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
			},
			agent: opts?.agent,
			method: "POST",
			body: {
				clientKey: this.key,
				task: {
					websiteURL: opts?.websiteURL,
					websiteKey: opts?.websiteKey,
					websiteSToken: null,
					type: "NoCaptchaTaskProxyless",
					...opts?.task,
				},
				softId: 802,
			},
		});
		if (createTask.errorId) throw createTask;
		console.log(createTask);
		let taskResult: any = { status: "processing" };
		const waited = Date.now();
		let errors = 0;

		do {
			taskResult = await promiseRequest(`${this.host}/getTaskResult`, {
				headers: {
					accept: "application/json, text/javascript, */*; q=0.01",
					"accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
					"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
					"sec-fetch-dest": "empty",
					"sec-fetch-mode": "cors",
					"sec-fetch-site": "cross-site",
					"User-Agent":
						"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
					Origin: "https://www.google.com",
					Referer: "https://www.google.com/",
				},
				method: "POST",
				agent: opts?.agent,
				body: { clientKey: this.key, taskId: createTask.taskId },
			}).catch((e) => {
				throw e;
				if (errors++ > 3) throw e;
			});
			console.log(taskResult);
			if (taskResult.errorId) throw taskResult;
			if ((Date.now() - waited) / 1000 > (opts?.timeout || 500))
				throw new Error(`Timeout(${opts?.timeout}s) exceed for captcha`);
			await sleep(1000);
		} while (taskResult.status === "processing");

		if (taskResult.cost && isNumber(this.balance)) {
			this.balance -= Number(taskResult.cost);
		}

		return <string>(taskResult?.solution?.gRecaptchaResponse || taskResult?.token);
	}
}
