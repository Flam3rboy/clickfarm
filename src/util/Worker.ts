import { db } from "./db";
import { makeid } from "./Util";

export class Worker {
	state: "available" | "working" | "stopped" = "available";
	uuid: string;

	start() {
		if (this.state === "working") return;
		db.events.emit("WORKER_WORKING", this);
		this.state = "working";
		this.uuid = makeid();
		this.do();
	}

	async do() {
		const db = require("../util/db").db;

		while (true) {
			if (this.state === "stopped") return;

			var action = db.actions.find((x: any) => x.status == "pending");
			if (!action) break;

			await action.do();

			// TODO: delete action
		}
		this.state = "available";
	}

	stop() {
		this.state = "stopped";
		db.events.emit("event", { type: "WORKER_STOPPED", id: this.uuid });
	}
}
