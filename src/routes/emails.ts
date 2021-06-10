import { Router } from "express";
import { check } from "lambert-server";
import { db } from "../util/db";
import { EmailProvider } from "../Email/EmailProvider";
import { EmailConfig } from "../types/Email";

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

		const provider = EmailProvider.fromConfig(body);
		await provider.init();
		db.emails.push(provider);

		res.json(provider.getConfig());
	}
);

export default router;
