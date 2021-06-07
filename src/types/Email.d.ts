export interface EmailConfig {
	type: EmailService;
	uuid: string;
	username: string;
	password: string;
	domain?: string;
	host?: string;
	port?: number;
	secure?: boolean;
	login?: string;
}

export type EmailService = "imap" | "gmail";
