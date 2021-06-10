import fs from "fs/promises";
import { Account, AccountOptions } from "./Account";
import { objectAsBase64, randomUserAgent, sleep, sleepRandom } from "../util/Util";
import { UAParser } from "ua-parser-js";
import { request, RequestOptions } from "../util/request";
import fetch from "node-fetch";
import FileType from "file-type";
import "missing-native-js-functions";
import { Browser, HTTPRequest } from "puppeteer-core";
import useProxy from "puppeteer-page-proxy";
import WebSocket from "ws";
import { AccountSettings } from "../types/Account";

export type DiscordAccountOptions = AccountOptions & {
	token?: string;
	user_id?: string;
	cookie?: string;
	fingerprint?: string;
	useragent?: string;
	science_token?: string;
};

export type DiscordFetchOptions = RequestOptions & { context?: any; fullURL?: boolean };

export class DiscordAccount extends Account {
	token?: string;
	user_id?: string;
	cookie?: string;
	fingerprint: string;
	intialized: Promise<any>;
	xSuperProperties: {
		browser: string;
		browser_user_agent?: string;
		browser_version?: string;
		client_version?: string;
		client_build_number: number;
		client_event_source: null;
		device: string; //"";
		os: string;
		os_version: string;
		os_arch?: string;
		referrer: string; //"";
		referrer_current: string; //"";
		referring_domain: string; //"";
		referring_domain_current: string; //"";
		release_channel: string; //"stable";
		system_locale: string;
	};
	useragent: string;
	client_uuid: string = "MgDGI4DI4grrNxdWS7fyLXYBAAABAAAA";
	science_token: string;
	avatarBase64?: string;
	connection?: WebSocket;

	constructor(props: DiscordAccountOptions) {
		super(props);
		this.initBrowserAgent();
	}

	get stringofbirth() {
		if (!this.dateofbirth) return;
		const month = `${this.dateofbirth.getMonth() + 1}`.padStart(2, "0");
		const day = `${this.dateofbirth.getDate()}`.padStart(2, "0");
		const year = this.dateofbirth.getFullYear();

		return `${year}-${month}-${day}`;
	}

	get xSuperPropertiesBase64() {
		return btoa(JSON.stringify(this.xSuperProperties));
		return objectAsBase64(this.xSuperProperties);
	}

	getSettings(): AccountSettings & {
		user_id?: string;
		token?: string;
		cookie?: string;
		fingerprint?: string;
		useragent?: string;
	} {
		return {
			...super.getSettings(),
			user_id: this.user_id,
			token: this.token,
			cookie: this.cookie,
			fingerprint: this.fingerprint,
			useragent: this.useragent,
		};
	}

	async init() {
		if (this.intialized) return this.intialized;
		this.intialized = Promise.all([this.initFingerprint(), this.initAvatar(), this.emailProvider?.init()]);
		return this.intialized;
	}

	async initAvatar() {
		if (!this.avatar) return;
		try {
			let buffer: Buffer;
			if (this.avatar.startsWith("http")) {
				const request = await fetch(this.avatar);
				buffer = await request.buffer();
			} else {
				buffer = <Buffer>(<unknown>await fs.readFile(this.avatar, { encoding: "binary" }));
			}
			const filetype = await FileType.fromBuffer(buffer);
			if (!filetype || !buffer) return;
			this.avatarBase64 = `data:${filetype.mime};base64,${Buffer.concat([buffer, Buffer.from("0x3af6")]).toString(
				"base64"
			)}`;
		} catch (error) {
			console.error("error getting avatar for " + this.avatar, error);
		}
	}

	async initFingerprint() {
		if (this.fingerprint) return;
		const { res } = await this.fetch("https://discord.com/register", { fullURL: true, res: true });
		this.cookie = res.headers.get("set-cookie")?.split("; ")?.[0];
		const { fingerprint } = await this.fetch("/experiments", { context: { location: "Register" } });
		this.fingerprint = fingerprint;
	}

	initBrowserAgent() {
		if (!this.useragent) this.useragent = randomUserAgent();
		const uaparser = new UAParser(this.useragent);
		const browser = uaparser.getBrowser();
		const os = uaparser.getOS();

		this.xSuperProperties = {
			browser: <string>browser.name,
			// browser: "Discord Client",
			// client_version: "0.0.266",
			browser_user_agent: this.useragent,
			browser_version: <string>browser.version,
			client_build_number: 78937,
			client_event_source: null,
			device: "",
			referrer: "",
			referrer_current: "",
			referring_domain: "",
			referring_domain_current: "",
			release_channel: "stable",
			os: <string>os.name,
			os_version: <string>os.version,
			// os_arch: "x64",
			// TODO: adjust locale based on ip location
			system_locale: "de",
		};
	}

	async fetch(path: string, opts?: DiscordFetchOptions) {
		const url = opts?.fullURL ? path : "https://discord.com/api/v8" + path;
		if (!opts) opts = {};
		if (!opts.headers) opts.headers = {};
		if (opts.context) opts.headers["x-context-properties"] = objectAsBase64(opts.context);
		if (this.fingerprint) opts.headers["x-fingerprint"] = this.fingerprint;
		if (this.useragent) opts.headers["user-agent"] = this.useragent;
		if (this.token) opts.headers["authorization"] = this.token;
		if (this.proxy) opts.agent = this.proxy.agent;
		if (this.cookie) opts.headers.cookie = this.cookie;

		opts.headers = {
			authority: "discord.com",
			accept: "*/*",
			referer: "https://discord.com/",
			origin: "https://discord.com",
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-origin",
			"sec-ch-ua": `"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"`,
			"sec-ch-ua-mobile": "?0",
			"accept-language": "de",
			"x-super-properties": this.xSuperPropertiesBase64,
			...opts.headers,
		};

		return request(url, opts);
	}

	async science(type: string, properties: any) {
		// "mktg_page_viewed"
		let body: any = {
			// @ts-ignore
			events: [
				{
					type: type,
					properties: {
						client_track_timestamp: Math.floor(Date.now() - Math.random() * 500 + 500),
						client_uuid: this.client_uuid,
						client_send_timestamp: Date.now(),
						...properties,
					},
				},
			],
		};
		if (this.science_token) body.science_token = this.science_token;

		return this.fetch("/science", { body });
	}

	async solveCaptcha(service: any, key?: string) {
		console.log("solve", service);
		switch (service) {
			case "recaptcha":
				return this.captchaProvider?.solve({
					websiteKey: key || "6Lef5iQTAAAAAKeIvIY-DeexoO3gj7ryl9rLMEnn",
					websiteURL: "https://discord.com/",
					agent: this.proxy?.agent,
					timeout: 300,
					task: {
						type: "NoCaptchaTaskProxyless",
					},
				});
			case "hcaptcha":
				return this.captchaProvider?.solve({
					websiteKey: key || "f5561ba9-8f1e-40ca-9b5b-a0b3f719ef34",
					websiteURL: "https://discord.com/",
					agent: this.proxy?.agent,
					timeout: 300,
					task: {
						type: "HCaptchaTaskProxyless",
					},
				});
			default:
				throw "unkown captcha service: " + service;
		}
	}

	async repeatAction(func: Function) {
		let error;
		let captcha_key = null;
		let count = 0;
		do {
			try {
				error = null;
				return await func(captcha_key);
			} catch (e) {
				error = e;
				if (count++ >= 2) throw e;
				if (error && error.captcha_key) {
					captcha_key = await this.solveCaptcha(error.captcha_service, error.captcha_sitekey);
				} else if (error && error.retry_after) {
					await sleep(error.retry_after * 1000);
				} else {
					throw error;
				}
			}
		} while (error);
	}

	async registerBrowser({ browser, invite }: { browser: Browser; invite?: string }) {
		await this.init();
		const context = await browser.createIncognitoBrowserContext();
		try {
			const page = await context.newPage();

			await page.setRequestInterception(true);
			page.on("request", async (request: HTTPRequest) => {
				const { authorization } = request.headers();
				if (authorization) this.token = authorization;
				if (request.url().endsWith("/science")) {
					request.abort();
				} else {
					if (this.proxy && ["xhr", "fetch", "websocket"].includes(request.resourceType()))
						useProxy(request, this.proxy.url);
					else request.continue();
				}
			});

			// if (invite) await page.goto(`https://discord.gg/${invite}`);
			// else
			await page.goto(`https://discord.com/register`);

			await page.waitForSelector(`[type=email]`);
			if (!this.emailProvider) throw "you must specify an email";
			if (!this.password) throw "you must specify a password";
			if (!this.username) throw "you must specify an username";
			const born = this.objectofbirth;
			if (!born) throw "you must specify a date of birth";

			await page.type(`[type=email]`, this.emailProvider.email);
			await page.type(`[type=password]`, this.password);
			await page.type(`[name=username]`, this.username);

			await page.click(`[class*=inputMonth] [class*=control]`);
			await page.click(`[class*=inputMonth] [class*=menu] > div > div:nth-child(${born.month})`);

			await page.click(`[class*=inputDay] [class*=control]`);
			await page.click(`[class*=inputDay] [class*=menu] > div > div:nth-child(${born.day})`);

			await page.click(`[class*=inputYear] [class*=control]`);
			await page.click(
				`[class*=inputYear] [class*=menu] > div > div:nth-child(${18 + Math.randomIntBetween(1, 20)})`
			);

			await page.click(`[class*=checkbox] [class*=inputDefault]`);
			await sleep(15000);
			console.log("sleep 15sec");
			await page.click(`[type="submit"]`);
			await page.waitForNavigation();
		} catch (e) {
			console.error(e);
			throw e;
		} finally {
			// await context.close();
		}
	}

	async verifyEmail() {
		if (!this.emailProvider) throw "no email provider";
		console.log("wait for mail");
		const self = this;

		const mail = await this.emailProvider.waitFor(
			(email: any) =>
				email.recipient.equalsIgnoreCase(this.emailProvider?.email) && email.sender === "noreply@discord.com"
		);
		const link = <string>mail.text.match(/(https:.+)\n/)?.[1];

		const { res } = await this.fetch(link, { redirect: "manual", fullURL: true, res: true });
		if (res.status >= 400) throw "email verify link not working";
		const href = <string>res.headers.get("location");
		const emailtoken = href.split("=")[1];
		console.log("verify email");

		function verify(captcha_key: string) {
			return self.fetch("/auth/verify", { body: { captcha_key, token: emailtoken } });
		}

		await this.repeatAction(verify);
	}

	async register({ invite, browser }: { invite?: string; browser?: Browser } = {}): Promise<void> {
		if (browser) return this.registerBrowser({ invite, browser });
		const self = this;
		await this.intialized;
		console.log("wait 3sec");
		await sleep(3000);

		console.log(await this.fetch("https://api.my-ip.io/ip", { fullURL: true }));

		console.log("register", this.emailProvider?.email);
		var additionalOptions: any = {};
		if (self.emailProvider && !invite) additionalOptions.email = self.emailProvider.email;
		if (self.password && !invite) additionalOptions.password = self.password;
		if (self.dateofbirth && !invite) additionalOptions.date_of_birth = self.stringofbirth;

		async function reg(captcha_key: string) {
			return await self.fetch("/auth/register", {
				body: {
					fingerprint: self.fingerprint,
					username: self.username,
					invite,
					consent: true,
					gift_code_sku_id: null,
					captcha_key,
					...additionalOptions,
				},
				headers: {
					authorization: "undefined",
				},
			});
		}
		var { token } = await this.repeatAction(reg);
		this.token = token;

		await this.postRegisterRequests();

		if (this.emailProvider && !invite) {
			await this.verifyEmail();
		} else {
			// guest account
		}

		console.log("sucessfully registered");
	}

	async patchUser() {
		return this.fetch("/users/@me", {
			method: "PATCH",
			body: {
				email: this.emailProvider?.email,
				password: this.password,
			},
		});
	}

	async uploadDateOfBirth() {
		return this.fetch("/users/@me", {
			method: "PATCH",
			body: {
				date_of_birth: this.stringofbirth,
			},
		});
	}

	async postRegisterRequests() {
		return await Promise.all([
			this.fetch("/gateway"),
			this.fetch("/users/@me/affinities/guilds"),
			this.fetch("/users/@me/affinities/users"),
			this.fetch("/users/@me/library"),
			this.fetch("/applications/detectable"),
			this.fetch("/tutorial/indicators/suppress", { method: "POST" }),
		]);
	}

	async connect() {
		// TODO: use proxy
		this.connection = new WebSocket("wss://gateway.discord.gg/?encoding=json&v=9");
		this.connection.on("message", (data) => {
			console.log(data);
		});
		this.connection.once("open", () => {
			this.connection?.send(
				JSON.stringify({
					token: this.token,
					capabilities: 125,
					properties: {
						os: "Windows",
						browser: "Discord Client",
						release_channel: "stable",
						client_version: "0.0.263",
						os_version: "19.6.0",
						os_arch: "x64",
						system_locale: "en-US",
						client_build_number: 86782,
						client_event_source: null,
					},
					presence: { status: "online", since: 0, activities: [], afk: false },
					compress: false,
					client_state: {
						guild_hashes: {},
						highest_last_message_id: "0",
						read_state_version: 0,
						user_guild_settings_version: -1,
					},
				})
			);
		});
	}

	async login() {}

	async uploadAvatar() {
		return this.fetch("/users/@me", {
			body: {
				avatar: this.avatarBase64,
			},
			method: "PATCH",
		});
	}

	sendFriendRequest(tag: string) {
		const username = tag.split("#")[0];
		const discriminator = tag.split("#")[1];

		return this.fetch("/users/@me/relationships", {
			body: {
				username,
				discriminator,
			},
		});
	}

	removeFriend(id: string) {
		return this.fetch(`/users/@me/relationships/${id}`, {
			method: "DELETE",
		});
	}

	async directMessage(userid: string, text: string) {
		const { id } = await this.fetch(`/users/@me/channels`, {
			body: {
				recipients: [userid],
			},
		});
		return this.sendMessage(id, text);
	}

	async sendMessage(channelid: string, content: string) {
		return this.fetch(`/channels/${channelid}/messages`, {
			body: {
				content,
			},
		});
	}

	async fetchMessages(channelid: string) {
		return this.fetch(`/channels/${channelid}/messages?limit=50`);
	}

	async addReaction(channelid: string, messageid: string, emoji: string) {
		emoji = encodeURIComponent(emoji);
		return this.fetch(`/channels/${channelid}/messages/${messageid}/reactions/${emoji}/%40me`, {
			method: "PUT",
		});
	}

	async setHypesquad(house_id: 1 | 2 | 3) {
		return this.fetch("/hypesquad/online", { body: { house_id } });
	}

	async leaveServer(id: string) {
		return this.fetch(`/users/@me/guilds/${id}`, { method: "DELETE" });
	}

	async joinServer(invite: string) {
		const i = invite.split("/").last();

		const { channel, guild } = await this.fetch(`/invites/${i}`);

		return this.fetch(`/invites/${i}`, {
			method: "POST",
			context: {
				location: "Join Guild",
				location_guild_id: guild.id,
				location_channel_id: channel.id,
				location_channel_type: channel.type,
			},
		});
	}

	async close() {
		await this.emailProvider?.close();
		this.connection?.close();
	}
}

/*

Science requests aren't needed
await this.science("mktg_page_viewed", {
	has_session: false,
	page_name: "landing",
	previous_link_location: null,
	previous_page_name: null,
});
await sleepRandom(500, 1000);
await this.science("main_navigation_menu", {
	page_name: "landing",
	linkClicked: "login",
});
await sleepRandom(250, 500);
await this.science("keyboard_mode_toggled", {
	accessibility_support_enabled: false,
	accessibility_features: 128,
	enabled: false,
});
await this.science("login_viewed", {
	location: "Non-Invite Login Page",
	login_source: null,
	accessibility_support_enabled: false,
	accessibility_features: 128,
});
await sleepRandom(250, 500);
this.science("app_ui_viewed", {
	total_compressed_byte_size: 2176189,
	total_uncompressed_byte_size: 9861292,
	total_transfer_byte_size: 0,
	js_compressed_byte_size: 1409154,
	js_uncompressed_byte_size: 7319631,
	js_transfer_byte_size: 0,
	css_compressed_byte_size: 205356,
	css_uncompressed_byte_size: 1351021,
	css_transfer_byte_size: 0,
	load_id: uuidv4(),
	screen_name: "login",
	duration_ms_since_app_opened: 784,
	accessibility_support_enabled: false,
	accessibility_features: 128,
});
await sleepRandom(500, 1000);
await this.science("register_viewed", {
	location: "Non-Invite Register Page",
	registration_source: null,
	accessibility_features: 128,
	accessibility_support_enabled: false,
});
await self.science("age_gate_submitted", {
	dob: null, 
	source_section: "Register",
	accessibility_features: 128,
	accessibility_support_enabled: false,
});
*/
