import { Action } from "./Action";

export class Worker {
	state: "available" | "working" | "stopped" = "available";

	start() {
		if (this.state === "working") return;
		this.state = "working";
		this.do();
	}

	async do() {
		while (true) {
			if (this.state === "stopped") return;

			// var action = require("../util/db").db.actions.find((x: Action) => x.status == "pending");
			var action: any = false;
			if (!action) break;

			await action.do();
		}
		this.state = "available";
	}

	stop() {
		this.state = "stopped";
	}
}
