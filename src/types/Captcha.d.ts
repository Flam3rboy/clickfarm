export interface CaptchaSolveOptions {
	timeout?: number;
	agent?: any;
	task?: any;
	websiteURL: string;
	websiteKey: string;
}

export interface CaptchaConfig {
	service: CaptchaService;
	uuid: string;
	key: string;
	balance?: number;
}

export type CaptchaService = "2captcha" | "anti-captcha" | "anti-captcha-trial";
