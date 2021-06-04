import { Email } from "./Email";
import { EmailProvider } from "./EmailProvider";

export class EmailDummyProvider extends EmailProvider {
	constructor(public client: EmailProvider, username: string) {
		super(username, client.domain);
		this.init();
	}

	init() {
		this.client.on("NEW_MAIL", this.newMail);
		this.client.on("CLOSE", this.close);
	}

	newMail = (mail: Email) => {
		this.emit("NEW_MAIL", mail);
	};

	close() {
		this.client.off("CLOSE", this.close);
		this.client.off("NEW_MAIL", this.newMail);
	}
}
