import { DiscordAccount } from "../Account/DiscordAccount";
import { getBrowser } from "./Browser";
import { db } from "./db";
import { makeid } from "./Util";

export class Action {
	account_id: string;
	type: string;
	uuid: string;
	status: ActionStatus;
	error?: any;
	payload?: any;

	constructor(config: ActionConfig) {
		if (this.status == "inwork") this.status = "pending"; // program restarted and didn't quit action
		if (!this.status) this.status = "pending";
		if (config.uuid) this.uuid = makeid();

		Object.assign(this, config);
	}

	async do() {
		try {
			this.status = "inwork";

			const acc: any = require("../util/db").db.accounts.find((x: any) => x.uuid === this.account_id);
			if (!acc) return;

			this.type = `${acc.type} ${Object.entries(this.payload)
				.filter(([key, value]) => value)
				.map(([key]) => key)
				.join(", ")}`;

			switch (acc.type) {
				case "discord":
					const account = acc as DiscordAccount;
					const { register, uploadAvatar, connect, updateUser, uploadDateOfBirth, verifyEmail } = this
						.payload as DiscordAction;

					if (register) {
						var options: any = { ...register };
						if (register.browser) options.browser = await getBrowser();
						await account.register(options);
					}

					if (uploadDateOfBirth) await account.uploadDateOfBirth();
					if (updateUser) await account.patchUser();
					if (verifyEmail) await account.verifyEmail();
					if (connect) await account.connect();
					if (uploadAvatar) await account.uploadAvatar();

					break;
				default:
					throw new Error("Platform not supported: " + acc.type);
			}

			this.status = "done";
			db.events.emit("event", {
				type: "ACTION_DONE",
				id: this.uuid,
				message: `Action ${this.type} done`,
				total: db.actions.length,
				done: db.actions.filter((x) => x.status === "done").length,
			});
		} catch (error) {
			this.status = "error";
			this.error = error;
			db.events.emit("event", {
				type: "ACTION_ERROR",
				id: this.uuid,
				message: `Action Error ${this.type}: ${error}`,
			});
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
		invite?: string;
	};
	verifyEmail?: boolean;
	uploadDateOfBirth?: boolean;
	uploadAvatar?: boolean;
	connect?: boolean;
	updateUser?: boolean;
}
