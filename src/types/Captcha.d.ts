import { ProxyAgent } from "../Proxy";

export interface CaptchaSolveOptions {
	timeout?: number;
	agent?: ProxyAgent;
	task?: any;
	userAgent?: string;
	websiteURL: string;
	websiteKey: string;
}

export interface CaptchaConfig {
	service: CaptchaService;
	uuid: string;
	key: string;
	balance?: number;
	settings?: any;
}

export type CaptchaService = "2captcha" | "anti-captcha" | "anti-captcha-trial" | "anti-captcha-proxy" | "manual";
