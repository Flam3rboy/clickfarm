import { EventEmitter } from "events";
import { DB } from "../types/Database";

export const db: DB = {
	emails: [],
	captchas: [],
	proxies: [],
	accounts: [],
	workers: [],
	actions: [],
	events: new EventEmitter(),
};

// @ts-ignore
global.db = db;
