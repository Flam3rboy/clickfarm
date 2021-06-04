import fetch, { Response } from "node-fetch";
import { Account, AccountOptions } from "./Account";
import { request, RequestOptions } from "../util/request";
import { randomUserAgent } from "../util/Util";
import { getAnticaptchaToken } from "../Captcha/getAnticaptchaToken";
import { ProxyManager } from "../Proxy";
const ac = require("@antiadmin/anticaptchaofficial");

export type TwitchAccountOptions = AccountOptions & {
	proxy?: ProxyManager;
	access_token?: string;
};

export class TwitchAccount extends Account {
	static client_id = "kimne78kx3ncx6brgo4mv6wki5h1ko";
	useragent: string;
	intialized: Promise<any>;
	cookies: any = {};
	access_token: string;
	proxy?: ProxyManager;
	user_id: string;

	constructor(opts: TwitchAccountOptions) {
		super(opts);

		this.useragent = randomUserAgent();
		this.intialized = this.init();
	}

	getCookies() {
		return (
			Object.entries(this.cookies)
				.map(([key, value]) => `${key}=${value}`)
				.join("; ") + `; auth-token=${this.access_token}`
		);
	}

	async fetch(url: string, opts?: RequestOptions) {
		if (!opts) opts = {};
		if (!opts.headers) opts.headers = {};
		opts.agent = this.proxy?.agent;

		opts.headers = {
			...opts.headers,
			accept: "*/*",
			referer: "hhttps://www.twitch.tv/",
			origin: "https://www.twitch.tv",
			"accept-language": "en",
			"cache-control": "no-cache",
			"content-type": "text/plain;charset=UTF-8",
			pragma: "no-cache",
			"sec-ch-ua": '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
			"sec-ch-ua-mobile": "?0",
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-site",
			"user-agent": this.useragent,
			"client-id": TwitchAccount.client_id,
			cookie: this.getCookies(),
		};

		if (this.access_token) opts.headers.authorization = `OAuth ${this.access_token}`;

		const { body, res } = await request(url, { ...opts, res: true });
		const cookies = res.headers.raw()["set-cookie"] || [];

		cookies.forEach((cookie: any) => {
			const c = cookie.split("; ")[0];
			const [key, value] = c.split("=");
			// @ts-ignore
			this.cookies[key] = value;
		});

		return body;
	}

	async init() {
		// get unique_id user cookie
		await this.fetch("https://twitch.tv/");
		this.cookies.api_token = `twilight.${TwitchAccount.getRandomId()}`;
	}

	async getUserId() {
		if (this.user_id) return this.user_id;
		const res = await this.fetch(`https://gql.twitch.tv/gql`, {
			body: [
				{
					operationName: "UserMenuCurrentUser",
					variables: {},
					extensions: {
						persistedQuery: {
							version: 1,
							sha256Hash: "3fafec9996208e9c38f39893cc8cf7ed1933c77daff806b8171a1be54625b620",
						},
					},
				},
			],
		});
		this.user_id = res[0].data.currentUser.id;
		return this.user_id;
	}

	async retry(options: any, func: () => Promise<any>) {
		var tries = 0;

		while (tries++ < 2) {
			try {
				return await func();
			} catch (error: any) {
				// console.log(error);
				switch (error.error_code) {
					case 3022:
						// verify login location with email
						if (!this.emailProvider) throw "Can't verify email: no email provider set";

						const mail = await this.emailProvider.waitFor(
							(email: any) =>
								email.recipient === this.emailProvider?.email &&
								["account@twitch.tv", "no-reply@twitch.tv"].includes(email.sender)
						);

						const code = <string>mail.text.match(/\n+(\d{6})\n+/)?.[1];
						options.twitchguard_code = code;
						options.captcha = { proof: error.captcha_proof };
						break;
					case 1000:
						// captcha
						ac.settings.funcaptchaApiJSSubdomain = "client-api.arkoselabs.com";

						const token = await ac.solveFunCaptchaProxyless(
							"https://www.twitch.tv/signup",
							"E5554D43-23CC-1982-971D-6A2262A2CA24"
						);

						options.arkose = { token };

						break;
					default:
						// unkown error code
						throw error;
				}
			}
		}

		throw "too many tries";
	}

	async login() {
		await this.intialized;
		const self = this;

		var options: any = {
			username: this.username,
			password: this.password,
			client_id: TwitchAccount.client_id,
			undelete_user: false,
		};

		await this.retry(options, async () => {
			const { access_token } = await self.fetch("https://passport.twitch.tv/login", {
				body: options,
			});

			self.access_token = access_token;
		});
	}

	static async usernameAvailable(username: string) {
		const res = await fetch("https://gql.twitch.tv/gql", {
			headers: {
				"client-id": TwitchAccount.client_id,
			},
			method: "POST",
			body: JSON.stringify([
				{
					operationName: "UsernameValidator_User",
					variables: { username: username },
					extensions: {
						persistedQuery: {
							version: 1,
							sha256Hash: "fd1085cf8350e309b725cf8ca91cd90cac03909a3edeeedbd0872ac912f3d660",
						},
					},
				},
			]),
		});
		const available = await res.json();
		return available[0].data.isUsernameAvailable;
	}

	async register() {
		await this.intialized;
		const self = this;

		const day = this.dateofbirth?.getDate();
		const month = this.dateofbirth?.getMonth();
		const year = this.dateofbirth?.getFullYear();

		// if (!(await this.usernameAvailable())) throw `Username is not available: ${this.username}`;

		this.username = this.username?.replace(/\W/g, "");

		var options: any = {
			email: this.emailProvider?.email,
			username: this.username,
			password: this.password,
			client_id: TwitchAccount.client_id,
			include_verification_code: true,
			birthday: {
				day,
				month,
				year,
			},
		};

		await this.retry(options, async () => {
			// console.log(options);
			const result = await self.fetch("https://passport.twitch.tv/register", {
				body: options,
			});

			// console.log(result);

			self.access_token = result.access_token;
		});

		if (this.avatar) await this.changeProfilePicture(this.avatar);
	}

	async changeProfilePicture(url: string) {
		const user_id = await this.getUserId();

		const { upload_url } = await this.fetch(
			`https://api.twitch.tv/kraken/users/${user_id}/upload_image?client_id=${TwitchAccount.client_id}&api_version=5&image_type=profile_image&format=png`,
			{
				method: "POST",
			}
		);

		const pfpReq = await fetch(url);
		const pfp = await pfpReq.buffer();

		await fetch(upload_url, {
			method: "PUT",
			body: pfp,
		});
	}

	async close() {}

	static getRandomId() {
		return "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx".replace(/[xy]/g, function (e) {
			var t = (16 * Math.random()) | 0;
			return ("x" === e ? t : (3 & t) | 8).toString(16);
		});
	}
}
