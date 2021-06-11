import path from "path";
import fs from "fs";
import { Account } from "../Account";
import { db } from "./db";
import { EmailPool, ImapProvider } from "../Email";
import { CaptchaProvider } from "../Captcha/CaptchaProvider";
import ProxyPool from "../Proxy/ProxyPool";
import { EmailConfig } from "../types/Email";
import { ProxyConfig } from "../types/Proxy";
import { CaptchaConfig } from "../types/Captcha";
import { AccountConfig } from "../types/Account";
import { Worker } from "./Worker";
import { ActionConfig } from "../types/Action";
import { Action } from "./Action";

var configPath = path.join(__dirname, "..", "..", "config.json");
if (configPath.includes("snapshot")) configPath = path.join(path.dirname(process.execPath), "..", "config.json");

var config: Config = {
	captchas: [],
	proxies: [],
	emails: [],
	accounts: [],
	actions: [],
	browser: {
		user_agents: [],
		args: [],
	},
	workers_count: 1,
	captchas_solved: 0,
};

export async function init() {
	try {
		config = JSON.parse(fs.readFileSync(configPath, { encoding: "utf8" }));
	} catch (error) {
		return;
	}
	db.proxies = config.proxies.map((x) => ProxyPool.fromConfig(x));
	db.emails = config.emails.map((x) => EmailPool.fromConfig(x));
	db.accounts = config.accounts
		// .filter((x) => x.status !== "notregistered")
		.map((x) => Account.fromConfig(x));
	db.captchas = config.captchas.map((x) => CaptchaProvider.fromConfig(x));
	db.actions = config.actions.map((x) => Action.fromConfig(x));

	for (var i = 0; i < config.workers_count; i++) {
		db.workers.push(new Worker());
	}

	await Promise.all([
		...db.emails.map((x) => x.init()),
		...db.proxies.map((x) => x.init()),
		...db.workers.map((x) => x.start()),
	]);
}

try {
	init();
} catch (error) {}

export { config };

export function saveConfig() {
	config.proxies = db.proxies.map((x) => x.getConfig());
	config.accounts = db.accounts.map((x) => x.getConfig());
	config.emails = db.emails.map((x) => x.getConfig());
	config.actions = db.actions.map((x) => x.getConfig());
	config.captchas = db.captchas.map((x) => x.getConfig());

	fs.writeFileSync(configPath + ".temp", JSON.stringify(config, undefined, "\t"));
	try {
		JSON.parse(fs.readFileSync(configPath + ".temp", { encoding: "utf8" }));
	} catch (error) {
		return console.error("error saving database");
	}
	fs.renameSync(configPath + ".temp", configPath);
}

setInterval(saveConfig, 1000 * 10);

export interface Config {
	captchas: CaptchaConfig[];
	accounts: AccountConfig[];
	emails: EmailConfig[];
	proxies: ProxyConfig[];
	actions: ActionConfig[];
	browser: {
		args: string[];
		user_agents: string[];
		headless?: boolean;
		chrome?: string;
		devtools?: boolean;
		slowMo?: number;
	};
	workers_count: number;
	captchas_solved: number;
}
