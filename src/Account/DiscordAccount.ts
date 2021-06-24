import fs from "fs/promises";
import { Account, AccountOptions } from "./Account";
import { objectAsBase64, randomUserAgent, randomUsername, sleep, sleepRandom } from "../util/Util";
import { UAParser } from "ua-parser-js";
import { request, RequestOptions } from "../util/request";
import fetch from "node-fetch";
import FileType from "file-type";
import "missing-native-js-functions";
import { Browser, HTTPRequest } from "puppeteer-core";
import useProxy from "puppeteer-page-proxy";
import WebSocket from "ws";
import { AccountSettings } from "../types/Account";
import { v4 as uuidv4 } from "uuid";

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
		return await Promise.all([this.initFingerprint(), this.emailProvider?.init()]);
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

		// @ts-ignore
		this.xSuperProperties = {
			browser: <string>browser.name,
			// browser: "Discord Client",
			// client_version: "0.0.266",
			browser_user_agent: this.useragent,
			browser_version: <string>browser.version,
			client_build_number: 88296, // 78937,
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
			system_locale: "en",
		};
	}

	async fetch(path: string, opts?: DiscordFetchOptions) {
		const url = opts?.fullURL ? path : "https://discord.com/api/v9" + path;
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
			"accept-language": "en",
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
						accessibility_support_enabled: false,
						accessibility_features: 128,
						...properties,
					},
				},
			],
		};
		if (this.science_token) body.science_token = this.science_token;

		return this.fetch("/science", { body });
	}

	async solveCaptcha(service: any, key?: string) {
		switch (service) {
			case "recaptcha":
				return this.captchaProvider?.solve({
					websiteKey: key || "6Lef5iQTAAAAAKeIvIY-DeexoO3gj7ryl9rLMEnn",
					websiteURL: "https://discord.com/register",
					userAgent: this.useragent,
					agent: this.proxy?.agent,
					timeout: 300,
					task: {
						type: "recaptcha2",
					},
				});
			case "hcaptcha":
				return this.captchaProvider?.solve({
					websiteKey: key || "f5561ba9-8f1e-40ca-9b5b-a0b3f719ef34",
					websiteURL: "https://discord.com/register",
					agent: this.proxy?.agent,
					userAgent: this.useragent,
					timeout: 300,
					task: {
						type: "hcaptcha",
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
				console.log(e);
				if (error && error.captcha_key && count < 2) {
					captcha_key = await this.solveCaptcha(error.captcha_service, error.captcha_sitekey);
					count = 2;
				} else if (error && error.retry_after) {
					await sleep(error.retry_after * 1000);
				} else if (error?.errors?.username) {
					this.username = randomUsername();
				} else {
					throw error;
				}
			}
		} while (error);
	}

	async registerBrowser({ browser, invite }: { browser: Browser; invite?: string }) {
		const context = await browser.createIncognitoBrowserContext();
		try {
			const page = await context.newPage();

			await page.setRequestInterception(true);
			page.on("request", async (request: HTTPRequest) => {
				const { authorization } = request.headers();
				if (authorization) this.token = authorization;
				if (request.url().endsWith("/science") && false) {
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
			await page.click(`[type="submit"]`);
			await sleep(1000 * 60 * 5); // wait for captcha
			await page.waitForNavigation();
			this.created_at = new Date();
		} catch (e) {
			throw e;
		} finally {
			// await context.close();
		}
	}

	async register({
		invite,
		browser,
		onlyUsername,
	}: { invite?: string; browser?: Browser; onlyUsername?: boolean } = {}): Promise<void> {
		await this.emailProvider?.init();

		if (invite) invite = invite.split("/").last();
		if (browser) return this.registerBrowser({ invite, browser });
		await this.initFingerprint();
		const self = this;
		console.log(await this.fetch("https://api.my-ip.io/ip", { fullURL: true, agent: this.proxy?.agent }));

		await this.science("mktg_page_viewed", {
			has_session: false,
			page_name: "landing",
			previous_link_location: null,
			previous_page_name: null,
		});
		await sleepRandom(500, 1000);
		if (!onlyUsername) {
			await this.science("main_navigation_menu", {
				linkClicked: "login",
				page_name: "landing",
			});
			await sleepRandom(500, 1000);

			await this.science("login_viewed", {
				location: "Non-Invite Login Page",
				login_source: null,
			});

			await this.science("app_ui_viewed", {
				css_compressed_byte_size: 237531,
				css_transfer_byte_size: 0,
				css_uncompressed_byte_size: 1584863,
				duration_ms_since_app_opened: Math.randomIntBetween(1000, 2000),
				js_compressed_byte_size: 1675324,
				js_transfer_byte_size: 0,
				js_uncompressed_byte_size: 8890531,
				load_id: uuidv4(),
				screen_name: "login",
				total_compressed_byte_size: 2021488,
				total_transfer_byte_size: 0,
				total_uncompressed_byte_size: 10849675,
			});
			await this.fetch("/auth/location-metadata");

			await sleepRandom(500, 1000);

			await this.science("register_viewed", {
				location: "Non-Invite Login Page",
				registration_source: null,
			});
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
			});

			await sleepRandom(4000, 5000);

			await self.science("age_gate_submitted", {
				dob: null,
				source_section: "Register",
			});
		}

		console.log("register", this.emailProvider?.email);
		var additionalOptions: any = {};
		if (!onlyUsername) {
			if (self.emailProvider && !invite) additionalOptions.email = self.emailProvider.email;
			if (self.password && !invite) additionalOptions.password = self.password;
			if (self.dateofbirth && !invite) additionalOptions.date_of_birth = self.stringofbirth;
		}

		async function reg(captcha_key: string) {
			console.log("captcha_key:", captcha_key);
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

		this.created_at = new Date();

		console.log("sucessfully registered");
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
			this.fetch("/users/@me/survey"),
			this.fetch("/users/@me/library"),
			this.fetch("/applications/detectable"),
			this.fetch("/users/@me/settings", { body: { timezone_offset: -120 }, method: "PATCH" }),
			// this.fetch("/tutorial/indicators/suppress", { method: "POST" }),
			this.science("experiment_user_triggered", {
				name: "2021-04_impression_logging",
				revision: 0,
				population: 0,
				bucket: 1,
				location: "unknown",
			}),
			this.science("nuo_transition", {
				flow_type: "organic_registration",
				from_step: null,
				to_step: "nuf_started",
				seconds_on_from_step: 0,
			}),
			this.science("impression_guild_add_landing", {
				impression_type: "modal",
				impression_group: "guild_add_nuf",
				location: "impression_friends",
				location_page: "impression_friends",
				location_section: "impression_guild_add_landing",
			}),
			this.science("experiment_user_triggered", {
				name: "2020-09_guild_template_reorder",
				revision: 0,
				population: 1,
				bucket: 1,
				location: "unknown",
			}),
			this.science("friends_list_viewed", {
				tab_opened: "ADD_FRIEND",
			}),
			this.science("ready_payload_received", {
				compressed_byte_size: Math.randomIntBetween(10000, 20000),
				uncompressed_byte_size: Math.randomIntBetween(20000, 3000),
				compression_algorithm: "zlib-stream",
				packing_algorithm: "json",
				unpack_duration_ms: 1,
				identify_total_server_duration_ms: Math.randomIntBetween(50, 100),
				identify_api_duration_ms: Math.randomIntBetween(20, 100),
				identify_guilds_duration_ms: 0,
				presences_size: 2,
				users_size: 2,
				read_states_size: 42,
				private_channels_size: 2,
				user_guild_settings_size: 42,
				relationships_size: 2,
				guild_voice_states_size: 2,
				guild_channels_size: 2,
				guild_members_size: 2,
				guild_presences_size: 2,
				guild_roles_size: 2,
				guild_emojis_size: 2,
				guild_remaining_data_size: 2,
				num_guilds: 0,
				num_guild_channels: 0,
				num_guild_category_channels: 0,
				num_guilds_with_metadata_omitted: 0,
				num_guilds_with_channels_omitted: 0,
				num_guilds_with_roles_omitted: 0,
				duration_ms_since_identify_start: Math.randomIntBetween(200, 500),
				duration_ms_since_connection_start: Math.randomIntBetween(500, 1000),
				duration_ms_since_emit_start: Math.randomIntBetween(200, 500),
				is_reconnect: false,
				is_fast_connect: false,
				did_force_clear_guild_hashes: false,
				identify_uncompressed_byte_size: Math.randomIntBetween(500, 1000),
				identify_compressed_byte_size: Math.randomIntBetween(400, 600),
			}),
		]);
	}

	async connect() {
		// TODO: use proxy
		var interval: any;
		const self = this;
		var s: any;
		this.connection = new WebSocket("wss://gateway.discord.gg/?encoding=json&v=9");
		this.connection.on("message", (buffer) => {
			const data = JSON.parse(buffer.toString());
			console.log(data);
			s = data.s;

			switch (data.op) {
				case 10:
					interval = setInterval(() => {
						self.connection?.send(JSON.stringify({ op: 1, d: s }));
					}, data.d.heartbeat_interval * Math.random());

					this.connection?.send(
						JSON.stringify({
							op: 2,
							d: {
								token: this.token,
								capabilities: 125,
								properties: this.xSuperProperties,
								presence: { status: "online", since: 0, activities: [], afk: false },
								compress: false,
								client_state: {
									guild_hashes: {},
									highest_last_message_id: "0",
									read_state_version: 0,
									user_guild_settings_version: -1,
								},
							},
						})
					);
			}
		});
		this.connection.on("error", console.error);
		this.connection.on("close", (code, reason) => {
			console.log("close", { code, reason });
			if (interval) clearInterval(interval);
		});
		this.connection.once("open", () => {
			console.log("open");
		});
	}

	async login() {}

	async uploadAvatar() {
		if (!this.avatarBase64) await this.initAvatar();
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
