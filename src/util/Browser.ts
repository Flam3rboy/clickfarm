import { config } from "./Config";
import { pathExists } from "./Util";
import puppeteer, { Browser } from "puppeteer-core";

var browser: Promise<Browser>;

export async function getBrowser() {
	if (browser) return browser;

	var chromePath = <string>config.browser.chrome;
	if (typeof chromePath !== "string") {
		switch (process.platform) {
			case "darwin":
				chromePath =
					pathExists(`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`) ||
					pathExists(`/Applications/Google Chrome Dev.app/Contents/MacOS/Google Chrome Dev`) ||
					"";
				break;
			case "linux":
				break;
			case "win32":
				chromePath =
					pathExists(`%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe`) ||
					pathExists(`%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe`) ||
					pathExists(`%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe`) ||
					pathExists(`C:\\Program Files (x86)\\Google\\Application\\chrome.exe`) ||
					pathExists(`C:\\Program Files (x86)\\Google\\Application\\chrome.exe`) ||
					"";

				break;
			default:
				throw new Error("Platform not supported");
		}
	}
	if (!chromePath) throw new Error("Google Chrome not found");

	browser = puppeteer.launch({
		headless: config.browser.headless ?? false,
		executablePath: chromePath,
		args: config.browser.args,
		devtools: config.browser.devtools ?? false,
		slowMo: config.browser.slowMo ?? 100,
	});
}