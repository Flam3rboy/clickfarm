import { Router } from "express";
import { check, HTTPError } from "lambert-server";
import { db } from "../util/db";
import { EmailConfig } from "../types/Email";
import { EmailPool } from "../Email";

const router = Router();

router.get("/", (req, res) => {
	res.json(db.emails.map((x) => x.getConfig()));
});

router.get("/:id", (req, res) => {
	res.json(db.emails.find((x) => x.uuid === req.params.id)?.getConfig());
});

router.post(
	"/",
	check({
		type: String,
		username: String,
		password: String,
		$domain: String,
		$host: String,
		$port: Number,
		$secure: Boolean,
		$login: String,
	}),
	async (req, res) => {
		const body = req.body as EmailConfig;

		const exists = db.emails.find((x) => x.provider.username === req.body.username && x.type === body.type);
		if (exists) throw new HTTPError("Email already exists");

		const provider = EmailPool.fromConfig(body);
		await provider.init();
		db.emails.push(provider);

		res.json(provider.getConfig());
	}
);

export default router;
