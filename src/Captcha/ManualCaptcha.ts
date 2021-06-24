import { HTTPRequest } from "puppeteer-core";
import { CaptchaSolveOptions } from "../types/Captcha";
import { db, makeid } from "../util";
import { getBrowser } from "../util/Browser";
import { CaptchaProvider } from "./CaptchaProvider";
import useProxy from "puppeteer-page-proxy";

export class ManualCaptcha extends CaptchaProvider {
	static promises = new Map<string, any>();

	constructor(public key: string) {
		super();
		this.service = "manual";
	}

	async getBalance() {
		return 1;
	}

	async solve(opts: CaptchaSolveOptions): Promise<string> {
		const payload = {
			type: opts.task?.type,
			url: opts.websiteURL,
			key: opts.websiteKey,
			id: makeid(),
		};
		db.events.emit("event", {
			type: "CAPTCHA_ADD",
			payload,
		});
		const browser = await getBrowser();
		const context = await browser.createIncognitoBrowserContext();
		const page = await context.newPage();
		if (opts.userAgent) await page.setUserAgent(opts.userAgent);

		await page.setRequestInterception(true);
		const href = new URL(opts.websiteURL);

		page.on("request", async (request: HTTPRequest) => {
			if (opts.agent?.url && ["xhr", "fetch", "websocket"].includes(request.resourceType())) {
				if (request.url().startsWith("https://hcaptcha.com/checksiteconfig")) {
					var url = new URL(request.url());
					const p = new URLSearchParams(url.search);
					p.set("host", href.hostname);
					const newurl = url.origin + url.pathname + "?" + p.toString();
					request.url = () => newurl;
				}

				useProxy(request, opts.agent.url);
			} else request.continue();
		});
		await page.goto(
			`http://localhost:4932/captcha/hcaptcha.html?id=${payload.id}&key=${
				opts.websiteKey
			}&url=${encodeURIComponent(opts.websiteURL)}`
		);

		var result: string = "";
		var error: any;

		try {
			result = await new Promise((resolve, reject) => {
				const timeout = setTimeout(() => {
					reject("captcha manual save timeout");
				}, 1000 * 60 * 3);
				ManualCaptcha.promises.set(payload.id, { resolve, reject, timeout, payload });
			});
		} catch (e) {
			error = e;
		} finally {
			db.events.emit("event", {
				type: "CAPTCHA_REMOVE",
				id: payload.id,
			});
			ManualCaptcha.promises.delete(payload.id);
			await context.close();
		}

		if (error) throw error;
		return result;
	}
}
