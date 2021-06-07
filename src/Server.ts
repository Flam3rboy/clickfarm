import { Server } from "lambert-server";
import path from "path";

async function start() {
	const server = new Server({ jsonBody: true, port: 4932 });
	server.app.use((req, res, next) => {
		res.set("Access-Control-Allow-Origin", "*");
		next();
	});
	await server.registerRoutes(path.join(__dirname, "routes/"));
	await server.start();
}

start();
