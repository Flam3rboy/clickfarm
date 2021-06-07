import writeFileAtomic from "write-file-atomic";
import path from "path";
import fs from "fs";
import { Account } from "../Account";
import { db } from "./db";
import { EmailPool, ImapProvider } from "../Email";
import { CaptchaProvider } from "../Captcha/CaptchaProvider";
import { Action, ActionConfig } from "./Action";
import ProxyPool from "../Proxy/ProxyPool";
import { EmailConfig } from "../types/Email";
import { ProxyConfig } from "../types/Proxy";
import { CaptchaConfig } from "../types/Captcha";
import { AccountConfig } from "../types/Account";

const configPath = path.join(__dirname, "..", "..", "config.json");

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
};

export function init() {
	config = JSON.parse(fs.readFileSync(configPath, { encoding: "utf8" }));
	db.proxies = config.proxies.map((x) => ProxyPool.fromConfig(x));
	db.emails = config.emails.map((x) => EmailPool.fromConfig(x));
	db.accounts = config.accounts.map((x) => Account.fromConfig(x));
	db.captchas = config.captchas.map((x) => CaptchaProvider.fromConfig(x));
	db.actions = config.actions.map((x) => Action.fromConfig(x));
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

	return writeFileAtomic(configPath, JSON.stringify(config, null, "\t"));
}

setInterval(saveConfig, 1000 * 30);

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
}
