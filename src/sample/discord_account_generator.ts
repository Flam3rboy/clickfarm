// @ts-ignore
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
import { DiscordAccount } from "../Account/DiscordAccount";
import { ProxyPool } from "../Proxy/ProxyPool";
import { makeid, randomUsername, sleep } from "../util/Util";
import fs from "fs/promises";
import { MobileProxy } from "../Proxy/MobileProxy";
import path from "path";
import { ImapProvider, EmailPool, GmailPool } from "../Email";
import "missing-native-js-functions";
import { GmailProvider } from "../Email/GmailProvider";
import puppeteer from "puppeteer";

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

const threads = 1;

async function main(threads: number) {
	const emailPool = new EmailPool(
		new ImapProvider("email_username", "domain", "email_password", {
			host: "imap.host.com",
			port: 143,
			secure: false,
			login: "login_user@email.com",
		})
	);
	await emailPool.init();
	// const gmailPool = new GmailPool(new GmailProvider("gmail_username", `gmail_password`));
	// await gmailPool.init();

	// @ts-ignore
	const proxyPool = new ProxyPool(Tor, threads);
	const mobileproxyPool = new ProxyPool(MobileProxy, 1);
	await proxyPool.init();
	var errorCount = 0;

	for (let i = 0; i < threads; i++) {
		setTimeout(async () => {
			while (true) {
				try {
					const proxy = await proxyPool.getProxy();
					try {
						const username = randomUsername();
						let emailName = username.replace(/\W/g, "");
						if (emailName.length <= 2) emailName = makeid(7); // for weird non ascii usernames
						const email = emailPool.getProvider(emailName);

						let account = new DiscordAccount({
							proxy: proxy,
							emailProvider: email,
							username: username,
						});
						await account.register({ emailverify: false, invite: "6EedGvvPuq" });

						await account.postRegisterRequests();

						await sleep(1000 * 5);
						await account.uploadDateOfBirth();
						await sleep(1000 * 10);
						const { token } = await account.patchUser();
						account.token = token;
						await account.verifyEmail();

						await sleep(1000 * 10);
						await account.uploadAvatar();
						// await sleep(20000);
						// @ts-ignore
						// await account.setHypesquad(Math.randomIntBetween(1, 3));
						console.log(account.token);

						await fs.appendFile(
							path.join(__dirname, "/../../assets/Lists/tokens.txt"),
							account.token + "\n",
							"utf8"
						);
						await account.close();
					} catch (error) {
						errorCount++;
						console.error(error);
					}
					await proxy.release();
				} catch (error) {
					errorCount++;
					console.error(error);
				}
				if (errorCount >= 3) return;
			}
		}, 0);
	}
}

main(threads);
