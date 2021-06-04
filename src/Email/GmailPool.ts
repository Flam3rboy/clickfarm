import { makeid } from "../util/Util";
import { EmailDummyProvider } from "./EmailDummyProvider";
import { EmailPool } from "./EmailPool";

export class GmailPool extends EmailPool {
	getProvider(username?: string) {
		if (username) return new EmailDummyProvider(this.provider, username);
		const id = makeid(5);
		const name = this.provider.username;
		// .split("")
		// .map((x) => (Math.random() > 0.5 ? x + "." : x))
		// .join("");
		return new EmailDummyProvider(this.provider, `${name}+${id}`);
	}
}
