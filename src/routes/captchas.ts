import { Router } from "express";
import { check, HTTPError } from "lambert-server";
import { CaptchaProvider } from "../Captcha/CaptchaProvider";
import { ManualCaptcha } from "../Captcha/ManualCaptcha";
import { CaptchaConfig } from "../types/Captcha";
import { config } from "../util";
import { db } from "../util/db";

const router = Router();

router.get("/", (req, res) => {
	res.json({ total: config.captchas_solved, providers: db.captchas.map((x) => x.getConfig()) });
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

router.get("/solve/", (req, res) => {
	res.json(Array.from(ManualCaptcha.promises.values()));
});

router.post("/solve/", check({ id: String, token: String }), (req, res) => {
	const body = req.body as { id: string; token: string };
	const promise = ManualCaptcha.promises.get(body.id);
	if (!promise) throw new Error("Captcha not found");

	const { timeout, resolve, reject } = promise;

	clearTimeout(timeout);
	resolve(body.token);
	ManualCaptcha.promises.delete(body.id);

	res.json({ success: true });
});

router.get("/:id", (req, res) => {
	res.json(db.captchas.find((x) => x.uuid === req.params.id)?.getConfig());
});

router.delete("/:id", async (req, res) => {
	const captcha = db.captchas.find((x) => x.uuid === req.params.id);
	if (!captcha) throw new HTTPError("captcha provider not found");
	await captcha.close();
	db.captchas.remove(captcha);
	res.json({ success: true, ...captcha.getConfig() });
});

export default router;
