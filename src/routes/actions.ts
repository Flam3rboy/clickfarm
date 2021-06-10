import { Router } from "express";
import { check } from "lambert-server";
import { Action } from "../util/Action";
import { db } from "../util/db";

const router = Router();

router.get("/", (req, res) => {
	res.json(db.actions.map((x) => x.getConfig()));
});

router.get("/:id", (req, res) => {
	res.json(db.actions.find((x) => x.uuid === req.params.id)?.getConfig());
});

router.post("/", check({ account_ids: [String], payload: Object, type: String }), (req, res) => {
	const { account_ids, payload, type } = req.body as { account_ids: string[]; payload: any; type: string };

	for (const account_id of account_ids) {
		// @ts-ignore
		const action = Action.fromConfig({ account_id, payload, type });
		db.actions.push(action);
	}

	db.workers.forEach((x) => x.start());

	res.json({ success: true });
});

export default router;
