import express from "express";
import { Server } from "lambert-server";
import path from "path";
import process from "process";
import { db } from "./util";
import open from "open";
import accounts from "./routes/accounts";
import actions from "./routes/actions";
import captchas from "./routes/captchas";
import emails from "./routes/emails";
import proxies from "./routes/proxies";
import workers from "./routes/workers";

export function sendError(error: any) {
	try {
		console.error(error);
		db.events.emit("event", { type: "error", message: error });
	} catch (error) {}
}

process.on("uncaughtException", sendError);
process.on("unhandledRejection", sendError);

async function start() {
	const server = new Server({ jsonBody: true, port: 4932 });
	server.app.use((req, res, next) => {
		res.set("Access-Control-Allow-Origin", "*");
		res.set("Access-Control-Allow-Headers", "*");
		res.set("Access-Control-Allow-Methods", "*");
		next();
	});
	server.app.use(express.static(path.join(__dirname, "..", "gui", "build")));
	server.app.use(accounts);
	server.app.use(actions);
	server.app.use(captchas);
	server.app.use(emails);
	server.app.use(proxies);
	server.app.use(workers);
	await server.start();
	await open(`http://localhost:4932`);
}

start();
