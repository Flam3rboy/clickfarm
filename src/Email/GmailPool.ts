import { makeid } from "../util/Util";
import { EmailDummyProvider } from "./EmailDummyProvider";
import { EmailPool } from "./EmailPool";
import crypto from "crypto";
import { GmailProvider } from "./GmailProvider";

export class GmailPool extends EmailPool {
	constructor(public provider: GmailProvider) {
		super(provider);
		this.type = "gmail";
	}

	getProvider(username?: string, plusTrick?: boolean) {
		if (username) return new EmailDummyProvider(this.provider, username);
		const id = plusTrick ? `+${makeid(5)}` : "";
		var name = this.provider.email
			.split("@")[0]
			.split("")
			.map((x) => (crypto.randomInt(0, 2) ? x + "." : x))
			.join("");
		if (name.endsWith(".")) name = name.slice(0, -1);

		return new EmailDummyProvider(this.provider, `${name}${id}@${this.provider.email.split("@")[1]}`);
	}
}
