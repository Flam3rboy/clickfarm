import { EventEmitter } from "events";
import { EmailConfig, EmailService } from "../types/Email";
import { makeid } from "../util/Util";
import { Email } from "./Email";

export abstract class EmailProvider extends EventEmitter {
	type: EmailService;
	uuid: string;
	password: string;
	host: string;
	port: number;
	secure: boolean;

	constructor(public readonly email: string) {
		super();
		this.uuid = makeid();
	}

	init(): any | Promise<any> {}
	close(): any | Promise<any> {}

	async waitFor(filter: (email: Email) => boolean, opts?: { timeout: number }): Promise<Email> {
		return new Promise((res, rej) => {
			this.on("NEW_MAIL", m);
			function m(mail: Email) {
				try {
					if (filter(mail)) {
						return res(mail);
					}
				} catch (error) {
					console.error(error);
				}
			}
			setTimeout(() => {
				this.off("NEW_MAIL", m);
				return rej(new Error("Timeout for email"));
			}, 1000 * (opts?.timeout || 30));
		});
	}

	getConfig(): EmailConfig {
		return {
			password: this.password,
			type: this.type,
			uuid: this.uuid,
			host: this.host,
			email: this.email,
			port: this.port,
			secure: this.secure,
		};
	}

	static fromConfig(config: EmailConfig) {
		if (config.type === "gmail") {
			const Provider = require("./GmailProvider").GmailProvider;

			const provider = new Provider(config.email, config.password);
			if (config.uuid) provider.uuid = config.uuid;
			return provider;
		}

		// @ts-ignore
		const provider = require("./ImapProvider").ImapProvider;

		return new provider(config);
	}
}
