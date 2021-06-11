export interface EmailConfig {
	type: EmailService;
	uuid: string;
	email?: string;
	password: string;
	host?: string;
	port?: number;
	secure?: boolean;
}

export type EmailService = "imap" | "gmail";
