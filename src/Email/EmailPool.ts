import { EventEmitter } from "events";
import { EmailConfig, EmailService } from "../types/Email";
import { makeid } from "../util/Util";
import { EmailDummyProvider } from "./EmailDummyProvider";
import { EmailProvider } from "./EmailProvider";

export class EmailPool extends EventEmitter {
	type: EmailService;
	uuid: string;

	constructor(public provider: EmailProvider) {
		super();
		if (!this.uuid) this.uuid = makeid();
	}

	async init() {
		return this.provider.init();
	}

	getProvider(username?: string) {
		if (username) return new EmailDummyProvider(this.provider, username);
		return new EmailDummyProvider(this.provider, makeid(10));
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
