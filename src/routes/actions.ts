import { Router } from "express";
import { Action } from "../util/Action";
import { db } from "../util/db";

const router = Router();

router.get("/", (req, res) => {
	res.json(db.actions.map((x) => x.getConfig()));
});

router.get("/:id", (req, res) => {
	res.json(db.actions.find((x) => x.uuid === req.params.id)?.getConfig());
});

router.post("/", (req, res) => {
	const action = Action.fromConfig(req.body);
	db.actions.push(action);

	db.workers.forEach((x) => x.start());
	res.json(action.getConfig());
});

export default router;
