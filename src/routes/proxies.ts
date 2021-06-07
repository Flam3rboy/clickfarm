import { Router } from "express";
import { db } from "../util/db";

const router = Router();

router.get("/", (req, res) => {
	res.json(db.proxies.map((x) => x.getConfig()));
});

router.get("/:id", (req, res) => {
	res.json(db.proxies.find((x) => x.uuid === req.params.id)?.getConfig());
});

export default router;
