import { Router } from "express";
import { db } from "../util";
import { Action } from "../util/Action";

const router = Router();

router.get("/", (req, res) => {
	res.writeHead(200, {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		Connection: "keep-alive",
	});
	res.connection?.setTimeout(0);
	res.write(`data: {"message":"Connected"}\n\n`);
	function Event(data: any) {
		res.write(`data: ${JSON.stringify(data)}\n\n`);
	}
	db.events.on("event", Event);

	res.on("close", () => {
		db.events.off("event", Event);
	});
});

export default router;
