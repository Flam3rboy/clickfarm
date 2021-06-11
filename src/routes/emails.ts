import { Router } from "express";
import { check, HTTPError } from "lambert-server";
import { db } from "../util/db";
import { EmailConfig } from "../types/Email";
import { EmailPool } from "../Email";

const router = Router();

router.get("/", (req, res) => {
	res.json(db.emails.map((x) => x.getConfig()));
});

router.delete("/:id", (req, res) => {
	const mail = db.emails.find((x) => x.provider.uuid === req.params.id);
	if (!mail) throw new HTTPError("Mail not found");
	db.emails.remove(mail);
	res.json({ success: true, ...mail.getConfig() });
});

router.post(
	"/",
	check({
		type: String,
		email: String,
		password: String,
		$domain: String,
		$host: String,
		$port: Number,
		$secure: Boolean,
		$login: String,
	}),
	async (req, res) => {
		const body = req.body as EmailConfig;

		const exists = db.emails.find((x) => x.provider.email === req.body.email);
		if (exists) throw new HTTPError("Email already exists");

		const pool = EmailPool.fromConfig(body);
		await pool.init();
		db.emails.push(pool);

		res.json(pool.getConfig());
	}
);

export default router;
