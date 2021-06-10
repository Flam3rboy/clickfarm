import { Account } from "../Account";
import { db } from "../util/db";
import { Router } from "express";
import { check, HTTPError } from "lambert-server";
import { AccountConfig } from "../types/Account";

const router = Router();

router.get("/", (req, res) => {
	res.json(db.accounts.map((x) => ({ ...x.getConfig(), settings: undefined })));
});

router.get("/:id", (req, res) => {
	res.json(db.accounts.find((x) => x.uuid === req.params.id)?.getConfig());
});

router.post("/generate", check({ count: Number, type: String }), async (req, res) => {
	if (req.body.count <= 0 || req.body.count > 10000) throw new HTTPError("Count must be between 0 and 10000");

	const ids: string[] = [];

	for (var i = 0; i < req.body.count; i++) {
		// @ts-ignore
		const account = Account.fromConfig({ type: req.body.type, settings: { email_uuid: db.emails.random()?.uuid } });
		db.accounts.push(account);
		ids.push(account.uuid);
	}
	await Promise.all(db.accounts.map((x) => x.intialized));

	return res.json(ids);
});

router.post("/insert", check([{ type: String, settings: Object, $status: String, $settings: Object }]), (req, res) => {
	const body = req.body as AccountConfig[];
	const ids: string[] = [];

	body.forEach((x) => {
		if (!x.status) x.status = "notchecked";
		const account = Account.fromConfig(x);
		db.accounts.push(account);
		ids.push(account.uuid);
	});

	return res.json(ids);
});

export default router;
