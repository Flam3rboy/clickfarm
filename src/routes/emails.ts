import { Router } from "express";
import { db } from "../util/db";

const router = Router();

router.get("/", (req, res) => {
	res.json(db.emails.map((x) => x.getConfig()));
});

router.get("/:id", (req, res) => {
	res.json(db.emails.find((x) => x.uuid === req.params.id)?.getConfig());
});

export default router;
