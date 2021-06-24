import { EventEmitter } from "events";
import { EmailConfig, EmailService } from "../types/Email";
import { makeid } from "../util/Util";
import { EmailDummyProvider } from "./EmailDummyProvider";
import { EmailProvider } from "./EmailProvider";

export class EmailPool extends EventEmitter {
	type: EmailService;

	constructor(public provider: EmailProvider) {
		super();
	}

	async init() {
		return this.provider.init();
	}

	getProvider(username?: string) {
		const domain = "@" + this.provider.email.split("@")[1];
		if (username) return new EmailDummyProvider(this.provider, username + domain);
		return new EmailDummyProvider(this.provider, makeid(10) + domain);
	}

	async close() {
		this.emit("CLOSE");
		return this.provider.close();
	}

	getConfig(): EmailConfig {
		return this.provider.getConfig();
	}

	static fromConfig(config: EmailConfig) {
		const Pool = config.type === "gmail" ? require("./GmailPool").GmailPool : EmailPool;

		return new Pool(EmailProvider.fromConfig(config));
	}
}
