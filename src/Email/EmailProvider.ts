import { EventEmitter } from "events";
import { EmailConfig, EmailService } from "../types/Email";
import { Email } from "./Email";

export abstract class EmailProvider extends EventEmitter {
	type: EmailService;
	uuid: string;
	password: string;
	host: string;
	port: number;
	secure: boolean;
	login?: string;

	constructor(public readonly username: string, public readonly domain: string) {
		super();
	}

	init(): any | Promise<any> {}
	close(): any | Promise<any> {}

	get email() {
		return `${this.username}@${this.domain}`;
	}

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
			username: this.username,
			uuid: this.uuid,
			domain: this.domain,
			host: this.host,
			login: this.login,
			port: this.port,
			secure: this.secure,
		};
	}

	static fromConfig(config: EmailConfig) {
		if (config.type === "gmail") {
			const provider = require("./GmailProvider").GmailProvider;

			return new provider(config.username, config.password);
		}

		// @ts-ignore
		return new require("./ImapProvider").ImapProvider(config.username, config.domain as string, config.password, {
			host: config.host as string,
			port: config.port as number,
			secure: config.secure as boolean,
			login: config.login as string,
		});
	}
}
