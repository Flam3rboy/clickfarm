const ac = require("@antiadmin/anticaptchaofficial");
import { anticaptchakey } from "./config.json";

ac.shutUp();
ac.setAPIKey(anticaptchakey);

export * from "./Account/";
export * from "./Email/";
export * from "./Proxy/";
