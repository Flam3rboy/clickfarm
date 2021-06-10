import { Router } from "express";
import { check } from "lambert-server";
import { db, Worker } from "../util";

const router = Router();

router.get("/", (req, res) => {
	return res.json(db.workers.map((x) => ({ state: x.state, uuid: x.uuid })));
});

router.put("/", check({ count: Number }), (req, res) => {
	const { count } = req.body as { count: number };
	const length = db.workers.length;

	for (var i = length; i > count; i++) {
		db.workers[i].stop();
		delete db.workers[i];
	}

	db.workers = db.workers.filter((x) => !!x);

	for (var i = db.workers.length; i < count; i++) {
		db.workers.push(new Worker());
	}

	res.json({ success: true });
});

export default router;
