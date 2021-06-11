import { Router } from "express";
import { check, HTTPError } from "lambert-server";
import { ProxyConfig } from "../types/Proxy";
import { db } from "../util/db";
import ProxyPool from "../Proxy/ProxyPool";

const router = Router();

router.get("/", (req, res) => {
	res.json(db.proxies.map((x) => x.getConfig()));
});

router.get("/:id", (req, res) => {
	res.json(db.proxies.find((x) => x.uuid === req.params.id)?.getConfig());
});

router.post("/", check({ poolSize: Number, $list: [String], type: String }), async (req, res) => {
	const body = req.body as ProxyConfig;

	// @ts-ignore
	body.entries = body.list;

	const pool = ProxyPool.fromConfig(body);

	await pool.init();
	db.proxies.push(pool);

	res.json({ success: true, ...pool.getConfig() });
});

router.delete("/:id", (req, res) => {
	const proxy = db.proxies.find((x) => x.uuid === req.params.id);
	if (!proxy) throw new HTTPError("proxy not found");
	db.proxies.remove(proxy);

	res.json({ success: true, ...proxy.getConfig() });
});

export default router;
