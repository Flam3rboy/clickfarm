export interface Proxy {
	type: ProxyType;
	uuid: string;
	poolSize: number;
	entries?: string[];
}

export type ProxyType = "list" | "tor" | "huawei-lte";

export interface CaptchaSolveOptions {
	timeout?: number;
	agent?: any;
	task?: any;
	websiteURL: string;
	websiteKey: string;
}

export interface Captcha {
	service: CaptchaService;
	uuid: string;
	key: string;
	balance?: number;
}

export type CaptchaService = "2captcha" | "anti-captcha" | "anti-captcha-trial";

export interface Account {
	type: Platform;
	status: AccountState;
	uuid: string;
	created_at?: Date;
	settings: AccountSettings;
}

export type AccountState = "available" | "invalid" | "blocked" | "active" | "notchecked" | "notregistered" | "stopped";

export interface AccountSettings {
	password?: string;
	username?: string;
	avatar?: string;
	dateofbirth?: Date;
	email?: string;
	email_username?: string;
	email_uuid?: string;
}

export type Platform = "discord" | "twitch";

export interface Email {
	type: EmailService;
	uuid: string;
	username: string;
	password: string;
	domain?: string;
	host?: string;
	port?: number;
	secure?: boolean;
	login?: string;
}

export type EmailService = "imap" | "gmail";

export interface ActionConfig {
	account_id: string;
	type: string;
	uuid: string;
	status: ActionStatus;
	error?: any;
	payload: DiscordAction;
}

export type ActionStatus = "pending" | "inwork" | "done" | "error";

export interface DiscordAction {
	register?: {
		browser?: boolean;
		invite?: string;
	};
	verifyEmail?: boolean;
	uploadDateOfBirth?: boolean;
	uploadAvatar?: boolean;
	connect?: boolean;
	updateUser?: {
		email?: string;
	};
}

export interface Worker {
	state: "available" | "working" | "stopped";
	uuid: string;
}
