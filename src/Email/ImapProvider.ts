process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { EmailProvider } from "./EmailProvider";
// @ts-ignore
import ImapClient from "emailjs-imap-client";
import { Email } from "./Email";
import { simpleParser } from "mailparser";

export class ImapProvider extends EmailProvider {
	public client: any;

	constructor(opts: { password: string; host: string; port: number; secure: boolean; email: string }) {
		super(opts.email);
		this.host = opts.host;
		this.port = opts.port;
		this.secure = opts.secure;
		this.password = opts.password;
		this.client = new ImapClient(opts.host, opts.port, {
			auth: { user: opts.email, pass: opts.password },
			useSecureTransport: opts.secure,
			logLevel: "info",
		});
		this.client.onerror = console.error;
		this.client.onupdate = this.newMessage;
		this.type = "imap";
	}

	async init() {
		if (this.client._state) return;
		await this.client.connect();
		await this.client.selectMailbox("INBOX");
	}

	newMessage = async (path: string, type: string, value: string) => {
		if (type !== "exists") return;
		const messages = await this.client.listMessages(path, value, ["envelope", "body[]"]);
		messages.forEach(async (message: any) => {
			const body = message["body[]"];
			const email = await simpleParser(body);

			const mail: Email = {
				html: <string>email.html,
				text: <string>email.text,
				recipient: <string>email.to?.value[0].address,
				sender: <string>email.from?.value[0].address,
				subject: <string>email.subject,
			};
			console.log("got mail from: " + mail.sender + " to: " + mail.recipient);
			this.emit("NEW_MAIL", mail);
		});
	};

	async close() {
		return this.client.close();
	}
}
