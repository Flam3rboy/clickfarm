import { CaptchaProvider } from "./CaptchaProvider";
import fetch from "node-fetch";
import { isNumber } from "util";

export class TwoCaptcha extends CaptchaProvider {
	constructor(public apiKey: string) {
		super();
		this.service = "anti-captcha";
	}

	async getBalance() {
		const req = await fetch(`http://2captcha.com/res.php?json=1&key=${this.apiKey}&action=getbalance`);
		const json = await req.json();
		if (!json.status) throw json;

		this.balance = Number(json.request);
		return this.balance;
	}

	async solve(opts: { timeout?: number; agent?: any; task?: any; websiteURL: string; websiteKey: string }) {
		var type = "";

		switch (opts.task.type) {
			case "HCaptchaTaskProxyless":
				type = "userrecaptcha";
				break;
			case "NoCaptchaTaskProxyless":
			default:
				type = "hcaptcha";
		}

		const captcha = await fetch(
			`http://2captcha.com/in.php?key=${this.apiKey}&method=${type}&googlekey=${opts.websiteKey}&pageurl=${opts.websiteURL}&json=1`,
			{
				method: "POST",
				body: JSON.stringify({}),
			}
		);
		const body = await captcha.json();
		if (!body || !body.status) throw body;

		var response: any;

		do {
			var req = await fetch(
				`http://2captcha.com/res.php?json=1&id=${body.request}&key=${this.apiKey}&action=get`
			);
			response = req.json();
			if (response.status) return response.request;
		} while (!response?.status);

		if (response.price && isNumber(this.balance)) {
			this.balance -= Number(response.price);
		}
	}
}
