import { Server } from "lambert-server";
import path from "path";
import process from "process";
import { db } from "./util";

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
	await server.registerRoutes(path.join(__dirname, "routes/"));
	await server.start();
}

start();
