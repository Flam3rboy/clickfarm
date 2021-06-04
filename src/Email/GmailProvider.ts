import { ImapProvider } from "./ImapProvider";

export class GmailProvider extends ImapProvider {
	constructor(username: string, password: string) {
		super(username, "gmail.com", password, { host: "imap.gmail.com", port: 993, secure: true });
	}
}
