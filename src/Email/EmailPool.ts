import { EventEmitter } from "events";
import { makeid } from "../util/Util";
import { EmailDummyProvider } from "./EmailDummyProvider";
import { EmailProvider } from "./EmailProvider";

export class EmailPool extends EventEmitter {
	constructor(public provider: EmailProvider) {
		super();
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
}
