export interface ActionConfig {
	account_id: string;
	type: string;
	uuid: string;
	status: ActionStatus;
	payload: any;
	error?: any;
	repeat?: number;
}

export type ActionStatus = "pending" | "inwork" | "done" | "error";

export interface DiscordAction {
	register?: {
		browser?: boolean;
		invite?: string;
	};
	verifyEmail?: boolean;
	uploadDateOfBirth?: boolean;
	uploadAvatar?: boolean;
	connect?: boolean;
	updateUser?: boolean;
}
