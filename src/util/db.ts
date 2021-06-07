import { DiscordAccount, TwitchAccount } from "../Account";
import { CaptchaProvider } from "../Captcha/CaptchaProvider";
import { EmailPool } from "../Email";
import { Worker } from "./Worker";
import { Action } from "./Action";
import ProxyPool from "../Proxy/ProxyPool";

export const db: DB = {
	emails: [],
	captchas: [],
	proxies: [],
	accounts: [],
	workers: [],
	actions: [],
};

interface DB {
	emails: EmailPool[];
	captchas: CaptchaProvider[];
	proxies: ProxyPool[];
	accounts: (DiscordAccount | TwitchAccount)[];
	workers: Worker[];
	actions: Action[];
}
