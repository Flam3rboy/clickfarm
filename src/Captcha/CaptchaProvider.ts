import { CaptchaConfig, CaptchaService, CaptchaSolveOptions } from "../types/Captcha";
import { makeid } from "../util/Util";

export abstract class CaptchaProvider {
	public service: CaptchaService;
	public uuid: string;
	public key: string;
	public balance?: number = 0;

	constructor() {
		if (!this.uuid) this.uuid = makeid();
	}

	async init() {
		await this.getBalance();
	}

	async getBalance() {
		return this.balance;
	}

	solve(opts: CaptchaSolveOptions): Promise<string> {
		throw new Error("not implemented");
	}

	getConfig(): CaptchaConfig {
		return {
			service: this.service,
			uuid: this.uuid,
			key: this.key,
			balance: this.balance,
		};
	}

	static fromConfig(config: CaptchaConfig): CaptchaProvider {
		const Providers = {
			"2captcha": require("./2Captcha").TwoCaptcha,
			"anti-captcha": require("./AntiCaptcha").AntiCaptcha,
			"anti-captcha-trial": require("./AntiCaptcha").AntiCaptcha,
			"anti-captcha-proxy": require("./AntiCaptchaProxy").AntiCaptchaProxy,
			manual: require("./ManualCaptcha").ManualCaptcha,
		};

		try {
			Providers["anti-captcha-trial"] = require("./AntiCaptchaTrial").AntiCaptchaTrial;
		} catch (error) {}

		return Object.assign(new Providers[config.service](config.key), config);
	}

	async close() {}
}
