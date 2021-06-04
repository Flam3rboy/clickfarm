import { ProxyManager } from "./ProxyManager";
import fetch from "node-fetch";
import parser from "fast-xml-parser";
import NodeRSA from "node-rsa";
import http from "http";
import httpProxy from "http-proxy";
import url from "url";
import net from "net";
import { sleep } from "../util/Util";

var rsaKey: any;
var cookieHeader = "";
var token = "";
var localAddress = "192.168.8.100";

export class MobileProxy extends ProxyManager {
	private server: http.Server;
	private static count: number = 0;
	constructor() {
		super("http", "localhost", 8080);
		MobileProxy.count++;
	}

	public static get available() {
		return 1 - MobileProxy.count;
	}

	async init() {
		await login();
		this.server = http.createServer(async function (req, res) {
			var urlObj = url.parse(<string>req.url);
			var target = urlObj.protocol + "//" + urlObj.host;
			// console.log("Proxy HTTP request for:", target);
			var proxy = httpProxy.createProxyServer({ localAddress });

			proxy.on("error", function (err, req, res) {
				console.log("proxy error", err);
				res.end();
			});
			proxy.web(req, res, { target: target });
		});

		var regex_hostport = /^([^:]+)(:([0-9]+))?$/;

		var getHostPortFromString = function (hostString: any, defaultPort: any) {
			var host = hostString;
			var port = defaultPort;

			var result = regex_hostport.exec(hostString);
			if (result != null) {
				host = result[1];
				if (result[2] != null) {
					port = result[3];
				}
			}

			return [host, port];
		};

		this.server.addListener("connect", function (req, socket, bodyhead) {
			var hostPort = getHostPortFromString(req.url, 443);
			var hostDomain = hostPort[0];
			var port = parseInt(hostPort[1]);
			// console.log("Proxying HTTPS request for:", hostDomain, port);

			var proxySocket = new net.Socket();
			proxySocket.connect({ port, host: hostDomain, localAddress }, function () {
				proxySocket.write(bodyhead);
				socket.write("HTTP/" + req.httpVersion + " 200 Connection established\r\n\r\n");
			});

			proxySocket.on("data", function (chunk) {
				socket.write(chunk);
			});

			proxySocket.on("end", function () {
				socket.end();
			});

			proxySocket.on("error", function () {
				socket.write("HTTP/" + req.httpVersion + " 500 Connection error\r\n\r\n");
				socket.end();
			});

			socket.on("data", function (chunk: any) {
				proxySocket.write(chunk);
			});

			socket.on("end", function () {
				proxySocket.end();
			});

			socket.on("error", function () {
				proxySocket.end();
			});
		});
		return new Promise((res) => this.server.listen(this.port, () => res(null)));
	}

	async release() {
		this.emit("released", this);
		await newIp();
		await sleep(4000);

		return this;
	}

	async close() {
		this.server.close();
	}
}

async function newIp(): Promise<any> {
	return new Promise(async (resolve, reject) => {
		if (!token) await getToken();
		try {
			var res: any = await fetch("http://192.168.8.1/api/dialup/profiles", {
				method: "POST",
				headers: {
					"content-type": "application/x-www-form-urlencoded",
					cookie: cookieHeader,
					__RequestVerificationToken: token,
				},
				body: `<?xml version="1.0" encoding="UTF-8"?><request><Delete>0</Delete><SetDefault>2</SetDefault><Modify>2</Modify><Profile><Index>2</Index><IsValid>1</IsValid><Name>test</Name><ApnIsStatic>1</ApnIsStatic><ApnName>test${Math.floor(
					Math.random() * 10000
				)}</ApnName><DialupNum>*99#</DialupNum><Username></Username><AuthMode>0</AuthMode><IpIsStatic>0</IpIsStatic><IpAddress></IpAddress><DnsIsStatic>0</DnsIsStatic><PrimaryDns></PrimaryDns><SecondaryDns></SecondaryDns><ReadOnly>0</ReadOnly><iptype>0</iptype></Profile></request>`,
			});
			res = await res.text();
			res = parser.parse(res);
			// console.log("ip changed");

			res = res.response;
			token = "";
			console.log("new ip");
			setTimeout(() => resolve(null), 1000);
		} catch (error) {
			reject();
		}
	});
}

async function getToken() {
	try {
		var res = await fetch("http://192.168.8.1/api/webserver/SesTokInfo", {
			headers: {
				__RequestVerificationToken: "",
				cookie: cookieHeader,
			},
		});
		let body: any = parser.parse(await res.text());
		token = body.response.TokInfo;
		cookieHeader = body.response.SesInfo;
	} catch (e) {
		token = "";
		console.error(e);
	}
}

async function login() {
	if (!token) await getToken();
	try {
		var res: any = await fetch("http://192.168.8.1/api/user/hilink_login", {
			method: "GET",
			headers: {
				cookie: cookieHeader,
			},
		});
		res = await res.text();
		res = parser.parse(res);
		if (res.error) console.error(res.error.code);

		res = await fetch("http://192.168.8.1/api/user/state-login", {
			method: "GET",
			headers: {
				cookie: cookieHeader,
			},
		});
		res = await res.text();
		res = parser.parse(res);
		if (res.error) console.error(res.error.code);

		res = await fetch("http://192.168.8.1/api/webserver/publickey", {
			method: "GET",
			headers: {
				cookie: cookieHeader,
			},
		});
		res = await res.text();
		res = parser.parse(res);
		if (res.error) console.error(res.error.code);
		// rsaKey = { e: res.response.encpubkeyn, n: res.response.encpubkeye + "" };
		// const key = new NodeRSA();
		// key.importKey(
		// 	{
		// 		n: Buffer.from(rsaKey.n),
		// 		e: rsaKey.e,
		// 	},
		// 	"components-public"
		// );
		// rsaKey = key;

		// newIp();
	} catch (error) {
		console.error(error);
	}
}
