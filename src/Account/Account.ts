import { CaptchaProvider } from "../Captcha/CaptchaProvider";
import { EmailProvider } from "../Email/EmailProvider";
import { ProxyManager } from "../Proxy";
import { AccountConfig, AccountSettings, AccountState, Platform } from "../types/Account";
import { makeid, randomAvatar, randomUsername } from "../util/Util";

const YEAR = 1000 * 60 * 60 * 24 * 365;

export type AccountOptions = {
	emailProvider?: EmailProvider;
	captchaProvider?: CaptchaProvider;
	password?: string;
	username?: string;
	avatar?: string;
	dateofbirth?: Date;
	uuid?: string;
	status?: AccountState;
	created_at?: Date;
	type?: Platform;
	proxy?: ProxyManager;
};

export abstract class Account {
	uuid: string;
	emailProvider?: EmailProvider;
	captchaProvider?: CaptchaProvider;
	password?: string;
	username?: string;
	avatar?: string;
	dateofbirth?: Date;
	status: AccountState;
	type: Platform;
	proxy?: ProxyManager;
	created_at: Date;

	constructor(props: AccountOptions) {
		if (props.dateofbirth) props.dateofbirth = new Date(props.dateofbirth);
		if (!props.dateofbirth) props.dateofbirth = new Date(Date.now() - YEAR * 18 - Math.random() * 40 * YEAR); // random date between 18 and 58
		if (!props.password) props.password = makeid(10);
		if (!props.username) props.username = randomUsername();
		if (!props.avatar) props.avatar = randomAvatar();
		if (!props.uuid) props.uuid = makeid(20);
		if (!props.status) props.status = "notregistered";

		Object.assign(this, props);
	}

	get stringofbirth() {
		if (!this.dateofbirth) return;
		return `${this.dateofbirth.getDate()}.${this.dateofbirth.getMonth() + 1}.${this.dateofbirth.getFullYear()}`;
	}

	get objectofbirth() {
		if (!this.dateofbirth) return;
		return {
			month: this.dateofbirth.getMonth() + 1,
			day: this.dateofbirth.getDate(),
			year: this.dateofbirth.getFullYear(),
		};
	}

	async register() {
		this.status = "available";
	}
	async login() {
		this.status = "available";
	}
	async close() {
		this.status = "stopped";
	}

	getSettings(): AccountSettings {
		return {
			password: this.password,
			username: this.username,
			avatar: this.avatar,
			dateofbirth: this.dateofbirth,
			email: this.emailProvider?.email,
			email_username: this.emailProvider?.username,
			email_uuid: this.emailProvider?.uuid,
		};
	}

	getConfig(): AccountConfig {
		return {
			uuid: this.uuid,
			status: this.status,
			type: this.type,
			settings: this.getSettings(),
		};
	}

	static fromConfig(config: AccountConfig) {
		const Provider = getProvider(config.type);
		// const emailProvider = require("../util/db")
		// 	.db.emails.find((x: EmailPool) => x.uuid === config.settings.email_uuid)
		// 	?.getProvider(config.settings.email_username);

		return new Provider({ ...config.settings, ...config /*, emailProvider*/ });
	}
}

function getProvider(type: Platform) {
	switch (type) {
		case "discord":
			return require("./DiscordAccount").DiscordAccount;
		case "twitch":
			return require("./TwitchAccount").TwitchAccount;
		default:
			throw new Error("Account type not supported");
	}
}
