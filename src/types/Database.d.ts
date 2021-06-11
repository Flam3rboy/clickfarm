import { DiscordAccount, TwitchAccount } from "../Account";
import { CaptchaProvider } from "../Captcha/CaptchaProvider";
import { EmailPool } from "../Email";
import { Worker } from "./Worker";
import { Action } from "./Action";
import ProxyPool from "../Proxy/ProxyPool";

interface DB {
	emails: EmailPool[];
	captchas: CaptchaProvider[];
	proxies: ProxyPool[];
	accounts: (DiscordAccount | TwitchAccount)[];
	workers: Worker[];
	actions: Action[];
	events: EventEmitter;
}
