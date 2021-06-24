// @ts-ignore
process.binding("http_parser").HTTPParser = require("./Captcha/http-parser").HTTPParser;

import express from "express";
import path from "path";
import { db } from "./util";
import open from "open";
import accounts from "./routes/accounts";
import actions from "./routes/actions";
import captchas from "./routes/captchas";
import emails from "./routes/emails";
import proxies from "./routes/proxies";
import workers from "./routes/workers";
import events from "./routes/events";
import bodyParser from "body-parser";
import "express-async-errors";

export function sendError(error: any) {
	try {
		console.error(error?.message || error);
		db.events.emit("event", { type: "error", message: error });
	} catch (error) {}
}

process.on("uncaughtException", sendError);
process.on("unhandledRejection", sendError);

function start() {
	const app = express();
	app.use((req, res, next) => {
		res.set("Access-Control-Allow-Origin", "*");
		res.set("Access-Control-Allow-Headers", "*");
		res.set("Access-Control-Allow-Methods", "*");
		next();
	});
	app.use(express.static(path.join(__dirname, "..", "assets")));
	app.use(express.static(path.join(__dirname, "..", "gui", "build")));
	app.use(bodyParser.json());
	app.use("/accounts", accounts);
	app.use("/actions", actions);
	app.use("/captchas", captchas);
	app.use("/emails", emails);
	app.use("/proxies", proxies);
	app.use("/events", events);
	app.use("/workers", workers);
	// @ts-ignore
	app.use((error, req, res, next) => {
		if (error) {
			res.status(400).json({ message: error.toString() });
			return sendError(error);
		}
		return next(error);
	});
	app.get("*", function (req, res) {
		res.sendFile(path.join(__dirname, "..", "gui", "build", "index.html"));
	});
	app.listen(4932, async () => {
		console.log("Server started on http://localhost:4932");
		await open(`http://127.0.0.1:4932`);
	});
}

start();
