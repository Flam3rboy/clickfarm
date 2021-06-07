import { DiscordAccount } from "../Account/DiscordAccount";
import { getBrowser } from "./Browser";

export class Action {
	account_id: string;
	type: string;
	uuid: string;
	status: ActionStatus;
	error?: any;
	payload?: any;

	constructor(config: ActionConfig) {
		if (this.status == "inwork") this.status = "pending"; // program restarted and didn't quit action
		Object.assign(this, config);
	}

	async do() {
		try {
			this.status = "inwork";

			const acc: any = false; //require("../util/db").db.accounts.find((x: any) => x.uuid === this.account_id);
			if (!acc) return;

			switch (acc.type) {
				case "discord":
					const account = acc as DiscordAccount;
					const { register, uploadAvatar, connect, updateUser, uploadDateOfBirth } = <DiscordAction>(
						this.payload
					);

					if (register) {
						var options: any = { ...register };
						if (register.browser) options.browser = await getBrowser();
						account.register(options);
					}

					if (uploadDateOfBirth) await account.uploadDateOfBirth();
					if (connect) await account.connect();
					if (updateUser) await account.patchUser();
					if (uploadAvatar) await account.uploadAvatar();

					break;
				default:
					throw new Error("Platform not supported: " + acc.type);
			}
		} catch (error) {
			this.status = "error";
			this.error = error;
		}
	}

	getConfig(): ActionConfig {
		return {
			account_id: this.account_id,
			type: this.type,
			uuid: this.uuid,
			status: this.status,
			error: this.error,
			payload: this.payload,
		};
	}

	static fromConfig(config: ActionConfig): Action {
		return new Action(config);
	}
}

export interface ActionConfig {
	account_id: string;
	type: string;
	uuid: string;
	status: ActionStatus;
	error?: any;
	payload: any;
}

export type ActionStatus = "pending" | "inwork" | "done" | "error";

export interface DiscordAction {
	register?: {
		browser?: boolean;
		emailVerify?: boolean;
		invite?: string;
	};
	uploadDateOfBirth?: {};
	uploadAvatar?: {};
	connect?: {};
	updateUser?: {
		email?: string;
	};
}
