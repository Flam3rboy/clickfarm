import { Router } from "express";
import { check, HTTPError } from "lambert-server";
import { CaptchaProvider } from "../Captcha/CaptchaProvider";
import { CaptchaConfig } from "../types/Captcha";
import { config } from "../util";
import { db } from "../util/db";

const router = Router();

router.get("/", (req, res) => {
	res.json({ total: config.captchas_solved, providers: db.captchas.map((x) => x.getConfig()) });
});

router.get("/:id", (req, res) => {
	res.json(db.captchas.find((x) => x.uuid === req.params.id)?.getConfig());
});

router.post(
	"/",
	check({
		service: String,
		key: String,
	}),
	async (req, res) => {
		const body = req.body as CaptchaConfig;

		const provider = CaptchaProvider.fromConfig(body);
		await provider.init();
		db.captchas.push(provider);

		res.json({ success: true, ...provider.getConfig() });
	}
);

router.delete("/:id", async (req, res) => {
	const captcha = db.captchas.find((x) => x.uuid === req.params.id);
	if (!captcha) throw new HTTPError("captcha provider not found");
	db.captchas.remove(captcha);
	res.json({ success: true, ...captcha.getConfig() });
});

export default router;
