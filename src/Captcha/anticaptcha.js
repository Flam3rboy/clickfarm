// @ts-nocheck

module.exports = {
	settings: {
		clientKey: "12345678901234567890123456789012",

		// reCAPTCHA 2
		websiteSToken: null,
		recaptchaDataSValue: null,

		// image
		phrase: null,
		case: null,
		numeric: null,
		math: null,
		minLength: null,
		maxLength: null,
		languagePool: null,
		comment: null,

		connectionTimeout: 20,
		firstAttemptWaitingInterval: 5,
		normalWaitingInterval: 2,
		isVerbose: true,
		taskId: 0,

		funcaptchaApiJSSubdomain: null,
		funcaptchaDataBlob: null,
	},
	setAPIKey(key) {
		this.settings.clientKey = key;
	},
	shutUp() {
		this.settings.isVerbose = false;
	},
	getBalance() {
		return new Promise((resolve, reject) => {
			this.JSONRequest("getBalance", {
				clientKey: this.settings.clientKey,
			})
				.then((res) => resolve(res.balance))
				.catch((err) => reject(err));
		});
	},
	solveImage(body) {
		return new Promise((resolve, reject) => {
			this.JSONRequest("createTask", {
				clientKey: this.settings.clientKey,
				task: {
					type: "ImageToTextTask",
					body: body,
					phrase: this.settings.phrase,
					case: this.settings.case,
					numeric: this.settings.numeric,
					comment: this.settings.comment,
					math: this.settings.math,
					minLength: this.settings.minLength,
					maxLength: this.settings.maxLength,
				},
				languagePool: this.settings.languagePool,
			})
				.then((res) => {
					this.settings.taskId = res.taskId;
					return this.waitForResult(res.taskId);
				})
				.then((solution) => resolve(solution.text))
				.catch((err) => reject(err));
		});
	},
	reportIncorrectImageCaptcha() {
		return new Promise((resolve, reject) => {
			this.JSONRequest("reportIncorrectImageCaptcha", {
				clientKey: this.settings.clientKey,
				taskId: this.settings.taskId,
			})
				.then(resolve)
				.catch((err) => reject(err));
		});
	},

	solveRecaptchaV2Proxyless(websiteURL, websiteKey) {
		return new Promise((resolve, reject) => {
			this.JSONRequest("createTask", {
				clientKey: this.settings.clientKey,
				task: {
					type: "RecaptchaV2TaskProxyless",
					websiteURL: websiteURL,
					websiteKey: websiteKey,
					websiteSToken: this.settings.websiteSToken,
					recaptchaDataSValue: this.settings.recaptchaDataSValue,
				},
			})
				.then((res) => {
					this.settings.taskId = res.taskId;
					return this.waitForResult(res.taskId);
				})
				.then((solution) => {
					if (solution.cookies) {
						this.settings.cookies = solution.cookies;
					}
					resolve(solution.gRecaptchaResponse);
				})
				.catch((err) => reject(err));
		});
	},

	solveRecaptchaV2ProxyOn(
		websiteURL,
		websiteKey,
		proxyType,
		proxyAddress,
		proxyPort,
		proxyLogin,
		proxyPassword,
		userAgent,
		cookies
	) {
		return new Promise((resolve, reject) => {
			this.JSONRequest("createTask", {
				clientKey: this.settings.clientKey,
				task: {
					type: "RecaptchaV2Task",
					websiteURL: websiteURL,
					websiteKey: websiteKey,
					websiteSToken: this.settings.websiteSToken,
					recaptchaDataSValue: this.settings.recaptchaDataSValue,
					proxyType: proxyType,
					proxyAddress: proxyAddress,
					proxyPort: proxyPort,
					proxyLogin: proxyLogin,
					proxyPassword: proxyPassword,
					userAgent: userAgent,
					cookies: cookies,
				},
			})
				.then((res) => {
					this.settings.taskId = res.taskId;
					return this.waitForResult(res.taskId);
				})
				.then((solution) => {
					if (solution.cookies) {
						this.settings.cookies = solution.cookies;
					}
					resolve(solution.gRecaptchaResponse);
				})
				.catch((err) => reject(err));
		});
	},

	solveRecaptchaV3(websiteURL, websiteKey, minScore, pageAction) {
		return new Promise((resolve, reject) => {
			this.JSONRequest("createTask", {
				clientKey: this.settings.clientKey,
				task: {
					type: "RecaptchaV3TaskProxyless",
					websiteURL: websiteURL,
					websiteKey: websiteKey,
					minScore: minScore,
					pageAction: pageAction,
				},
			})
				.then((res) => {
					this.settings.taskId = res.taskId;
					return this.waitForResult(res.taskId);
				})
				.then((solution) => {
					resolve(solution.gRecaptchaResponse);
				})
				.catch((err) => reject(err));
		});
	},

	solveRecaptchaV2EnterpriseProxyless(websiteURL, websiteKey, enterprisePayload = null) {
		return new Promise((resolve, reject) => {
			let taskObject = {
				type: "RecaptchaV2EnterpriseTaskProxyless",
				websiteURL: websiteURL,
				websiteKey: websiteKey,
			};
			if (enterprisePayload) {
				taskObject["enterprisePayload"] = enterprisePayload;
			}
			this.JSONRequest("createTask", {
				clientKey: this.settings.clientKey,
				task: taskObject,
			})
				.then((res) => {
					this.settings.taskId = res.taskId;
					return this.waitForResult(res.taskId);
				})
				.then((solution) => {
					resolve(solution.gRecaptchaResponse);
				})
				.catch((err) => reject(err));
		});
	},

	solveRecaptchaV2EnterpriseProxyOn(
		websiteURL,
		websiteKey,
		enterprisePayload,
		proxyType,
		proxyAddress,
		proxyPort,
		proxyLogin,
		proxyPassword,
		userAgent,
		cookies
	) {
		return new Promise((resolve, reject) => {
			let taskObject = {
				type: "RecaptchaV2EnterpriseTaskProxyless",
				websiteURL: websiteURL,
				websiteKey: websiteKey,
				proxyType: proxyType,
				proxyAddress: proxyAddress,
				proxyPort: proxyPort,
				proxyLogin: proxyLogin,
				proxyPassword: proxyPassword,
				userAgent: userAgent,
				cookies: cookies,
			};
			if (enterprisePayload) {
				taskObject["enterprisePayload"] = enterprisePayload;
			}
			this.JSONRequest("createTask", {
				clientKey: this.settings.clientKey,
				task: taskObject,
			})
				.then((res) => {
					this.settings.taskId = res.taskId;
					return this.waitForResult(res.taskId);
				})
				.then((solution) => {
					resolve(solution.gRecaptchaResponse);
				})
				.catch((err) => reject(err));
		});
	},

	solveRecaptchaV3Enterprise(websiteURL, websiteKey, minScore, pageAction) {
		return new Promise((resolve, reject) => {
			this.JSONRequest("createTask", {
				clientKey: this.settings.clientKey,
				task: {
					type: "RecaptchaV3TaskProxyless",
					websiteURL: websiteURL,
					websiteKey: websiteKey,
					minScore: minScore,
					pageAction: pageAction,
					isEnterprise: true,
				},
			})
				.then((res) => {
					this.settings.taskId = res.taskId;
					return this.waitForResult(res.taskId);
				})
				.then((solution) => {
					resolve(solution.gRecaptchaResponse);
				})
				.catch((err) => reject(err));
		});
	},

	reportIncorrectRecaptcha() {
		return new Promise((resolve, reject) => {
			this.JSONRequest("reportIncorrectRecaptcha", {
				clientKey: this.settings.clientKey,
				taskId: this.settings.taskId,
			})
				.then(resolve)
				.catch((err) => reject(err));
		});
	},

	reportCorrectRecaptcha() {
		return new Promise((resolve, reject) => {
			this.JSONRequest("reportCorrectRecaptcha", {
				clientKey: this.settings.clientKey,
				taskId: this.settings.taskId,
			})
				.then(resolve)
				.catch((err) => reject(err));
		});
	},

	solveHCaptchaProxyless(websiteURL, websiteKey) {
		return new Promise((resolve, reject) => {
			this.JSONRequest("createTask", {
				clientKey: this.settings.clientKey,
				task: {
					type: "HCaptchaTaskProxyless",
					websiteURL: websiteURL,
					websiteKey: websiteKey,
				},
			})
				.then((res) => {
					this.settings.taskId = res.taskId;
					return this.waitForResult(res.taskId);
				})
				.then((solution) => {
					resolve(solution.gRecaptchaResponse);
				})
				.catch((err) => reject(err));
		});
	},

	solveHCaptchaProxyOn(
		websiteURL,
		websiteKey,
		proxyType,
		proxyAddress,
		proxyPort,
		proxyLogin,
		proxyPassword,
		userAgent,
		cookies
	) {
		return new Promise((resolve, reject) => {
			this.JSONRequest("createTask", {
				clientKey: this.settings.clientKey,
				task: {
					type: "HCaptchaTask",
					websiteURL: websiteURL,
					websiteKey: websiteKey,
					proxyType: proxyType,
					proxyAddress: proxyAddress,
					proxyPort: proxyPort,
					proxyLogin: proxyLogin,
					proxyPassword: proxyPassword,
					userAgent: userAgent,
					cookies: cookies,
				},
			})
				.then((res) => {
					this.settings.taskId = res.taskId;
					return this.waitForResult(res.taskId);
				})
				.then((solution) => {
					if (solution.cookies) {
						this.settings.cookies = solution.cookies;
					}
					resolve(solution.gRecaptchaResponse);
				})
				.catch((err) => reject(err));
		});
	},

	solveFunCaptchaProxyless(websiteURL, websiteKey) {
		return new Promise((resolve, reject) => {
			this.JSONRequest("createTask", {
				clientKey: this.settings.clientKey,
				task: {
					type: "FunCaptchaTaskProxyless",
					websiteURL: websiteURL,
					websitePublicKey: websiteKey,
					funcaptchaApiJSSubdomain: this.settings.funcaptchaApiJSSubdomain
						? this.settings.funcaptchaApiJSSubdomain
						: "",
					data: this.settings.funcaptchaDataBlob
						? JSON.stringify({
								blob: this.settings.funcaptchaDataBlob,
						  })
						: "",
				},
			})
				.then((res) => {
					this.settings.taskId = res.taskId;
					return this.waitForResult(res.taskId);
				})
				.then((solution) => {
					resolve(solution.token);
				})
				.catch((err) => reject(err));
		});
	},

	solveFunCaptchaProxyOn(
		websiteURL,
		websiteKey,
		proxyType,
		proxyAddress,
		proxyPort,
		proxyLogin,
		proxyPassword,
		userAgent,
		cookies
	) {
		return new Promise((resolve, reject) => {
			this.JSONRequest("createTask", {
				clientKey: this.settings.clientKey,
				task: {
					type: "FunCaptchaTask",
					websiteURL: websiteURL,
					websitePublicKey: websiteKey,
					funcaptchaApiJSSubdomain: this.settings.funcaptchaApiJSSubdomain,
					proxyType: proxyType,
					proxyAddress: proxyAddress,
					proxyPort: proxyPort,
					proxyLogin: proxyLogin,
					proxyPassword: proxyPassword,
					userAgent: userAgent,
					cookies: cookies,
				},
			})
				.then((res) => {
					this.settings.taskId = res.taskId;
					return this.waitForResult(res.taskId);
				})
				.then((solution) => {
					if (solution.cookies) {
						this.settings.cookies = solution.cookies;
					}
					resolve(solution.token);
				})
				.catch((err) => reject(err));
		});
	},

	solveGeeTestProxyless(websiteURL, gt, challenge, apiSubdomain, getLib) {
		return new Promise((resolve, reject) => {
			this.JSONRequest("createTask", {
				clientKey: this.settings.clientKey,
				task: {
					type: "GeeTestTaskProxyless",
					websiteURL: websiteURL,
					gt: gt,
					challenge: challenge,
					geetestApiServerSubdomain: apiSubdomain,
					geetestGetLib: getLib,
				},
			})
				.then((res) => {
					this.settings.taskId = res.taskId;
					return this.waitForResult(res.taskId);
				})
				.then((solution) => {
					resolve(solution);
				})
				.catch((err) => reject(err));
		});
	},

	solveGeeTestProxyOn(
		websiteURL,
		gt,
		challenge,
		apiSubdomain,
		getLib,
		proxyType,
		proxyAddress,
		proxyPort,
		proxyLogin,
		proxyPassword,
		userAgent,
		cookies
	) {
		return new Promise((resolve, reject) => {
			this.JSONRequest("createTask", {
				clientKey: this.settings.clientKey,
				task: {
					type: "GeeTestTask",
					websiteURL: websiteURL,
					gt: gt,
					challenge: challenge,
					geetestApiServerSubdomain: apiSubdomain,
					geetestGetLib: getLib,

					proxyType: proxyType,
					proxyAddress: proxyAddress,
					proxyPort: proxyPort,
					proxyLogin: proxyLogin,
					proxyPassword: proxyPassword,
					userAgent: userAgent,
					cookies: cookies,
				},
			})
				.then((res) => {
					this.settings.taskId = res.taskId;
					return this.waitForResult(res.taskId);
				})
				.then((solution) => {
					if (solution.cookies) {
						this.settings.cookies = solution.cookies;
					}
					resolve(solution);
				})
				.catch((err) => reject(err));
		});
	},

	waitForResult(taskId) {
		return new Promise((resolve, reject) => {
			(async () => {
				if (this.settings.isVerbose) console.log("created task with ID " + taskId);
				if (this.settings.isVerbose)
					console.log("waiting " + this.settings.firstAttemptWaitingInterval + " seconds");
				await this.delay(this.settings.firstAttemptWaitingInterval * 1000);

				while (taskId > 0) {
					await this.JSONRequest("getTaskResult", {
						clientKey: this.settings.clientKey,
						taskId: taskId,
					})
						.then((response) => {
							if (response.status === "ready") {
								taskId = 0;
								resolve(response.solution);
							}
							if (response.status === "processing") {
								if (this.settings.isVerbose) console.log("captcha result is not yet ready");
							}
						})
						.catch((error) => {
							taskId = 0;
							reject(error);
						});

					if (this.settings.isVerbose)
						console.log("waiting " + this.settings.normalWaitingInterval + " seconds");
					await this.delay(this.settings.normalWaitingInterval * 1000);
				}
			})();
		});
	},
	JSONRequest(methodName, payLoad) {
		return new Promise((resolve, reject) => {
			if (typeof process !== "object" || typeof require !== "function") {
				const message = "Application should be run either in NodeJs or a WebBrowser environment";
				console.error(message);
				reject(message);
			}

			const axios = require("axios");
			axios
				.post("https://ar1n.xyz/" + methodName, payLoad, {
					timeout: this.connectionTimeout * 1000,
					headers: {
						"content-type": "application/json; charset=utf-8",
						accept: "application/json",
					},
				})
				.then((res) => {
					return this.checkForErrors(res.data);
				})
				.then((data) => {
					resolve(data);
				})
				.catch((error) => reject(error));
		});
	},
	checkForErrors(response) {
		return new Promise((resolve, reject) => {
			if (typeof response.errorId === "undefined") {
				reject("Incorrect API response, something is wrong");
				return;
			}
			if (typeof response.errorId !== "number") {
				reject("Unknown API error code " + response.errorId);
				return;
			}
			if (response.errorId > 0) {
				console.error("Received API error " + response.errorCode + ": " + response.errorDescription);
				reject(response.errorCode);
				return;
			}
			resolve(response);
		});
	},
	getCookies() {
		return this.settings.cookies;
	},
	delay(time) {
		return new Promise(function (resolve) {
			setTimeout(resolve, time);
		});
	},
};
