export interface AccountConfig {
	type: Platform;
	status: AccountState;
	uuid: string;
	created_at?: Date;
	settings: AccountSettings;
}

export type AccountState = "available" | "invalid" | "blocked" | "active" | "notchecked" | "notregistered" | "stopped";

export interface AccountSettings {
	password?: string;
	username?: string;
	avatar?: string;
	created_at?: Date;
	dateofbirth?: Date;
	email?: string;
	email_uuid?: string;
}

export type Platform = "discord" | "twitch";
