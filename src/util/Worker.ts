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
		while (true) {
			if (this.state === "stopped") return;

			var action = require("../util/db").db.actions.find((x: any) => x.status == "pending");
			if (!action) break;

			await action.do();
			// TODO: delete action
		}
		this.state = "available";
		db.events.emit("event", { type: "WORKER_DONE", id: this.uuid });
	}

	stop() {
		this.state = "stopped";
		db.events.emit("event", { type: "WORKER_STOPPED", id: this.uuid });
	}
}
