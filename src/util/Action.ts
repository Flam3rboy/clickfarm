import { DiscordAccount } from "../Account/DiscordAccount";
import { ActionConfig, ActionStatus, DiscordAction } from "../types/Action";
import { DB } from "../types/Database";
import { getBrowser } from "./Browser";
import { makeid } from "./Util";

export class Action {
	account_id: string;
	type: string;
	uuid: string;
	status: ActionStatus;
	error?: any;
	payload?: any;
	repeat?: number;

	constructor(config: ActionConfig) {
		if (this.status == "inwork") this.status = "pending"; // program restarted and didn't quit action
		if (!this.status) this.status = "pending";
		if (config.uuid) this.uuid = makeid();

		Object.assign(this, config);
	}

	async do(): Promise<void> {
		const db: DB = require("../util/db").db;
		try {
			this.status = "inwork";

			var acc: any = db.accounts.find((x: any) => x.uuid === this.account_id);
			if (!acc) return;

			if (!acc.emailProvider) {
				acc.emailProvider = db.emails.random()?.getProvider();
			}
			if (!acc.proxy) {
				acc.proxy = await db.proxies
					.filter((x) => x)
					.random()
					?.getProxy();
			}
			if (!acc.captchaProvider) acc.captchaProvider = db.captchas.random();

			this.type = `${acc.type} ${Object.entries(this.payload)
				.filter(([key, value]) => value)
				.map(([key]) => key)
				.join(", ")}`;

			console.log("do action " + this.type);

			switch (acc.type) {
				case "discord":
					const account = acc as DiscordAccount;
					const { register, uploadAvatar, connect, updateUser, uploadDateOfBirth, verifyEmail } = this
						.payload as DiscordAction;

					if (register && account.status === "notregistered") {
						var options: any = { ...register };
						if (register.browser) options.browser = await getBrowser();
						await account.register(options).catch((e) => {
							if (e?.code === 40002) {
								account.status = "blocked";
							}
							throw e;
						});
						account.status = "available";
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

			if (!this.repeat) {
				this.status = "done";
				await acc.proxy?.release();
			}

			db.events.emit("event", {
				type: "ACTION_DONE",
				id: this.uuid,
				message: `Action ${this.type} done`,
			});

			if (this.repeat && this.repeat > 0) {
				this.repeat--;
				await this.do();
			}
		} catch (error) {
			if (acc) {
				acc.proxy?.release();
			}
			this.status = "error";
			this.error = error;
			db.events.emit("event", {
				type: "ACTION_ERROR",
				id: this.uuid,
				message: `Action Error ${this.type}: ${error?.message || error}`,
			});
			console.error(error);
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
