import { Agent } from "http";
import fetch, { RequestInit } from "node-fetch";

export type RequestOptions = {
	headers?: {
		[key: string]: string;
	};
	method?: "POST" | "GET" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "TRACE" | "OPTIONS" | "CONNECT";
	body?: any;
	timeout?: number;
	size?: number;
	follow?: number;
	compress?: boolean;
	agent?: Agent;
	signal?: AbortSignal | null;
	res?: boolean;
	redirect?: string;
};

// TODO: save cookie (different for each proxy)

export async function request(url: string, opts?: RequestOptions): Promise<any> {
	if (!opts) opts = {};
	if (!opts.headers) opts.headers = {};
	if (opts.body) {
		if (typeof opts.body === "object") {
			opts.headers["content-type"] = "application/json";
			opts.body = JSON.stringify(opts.body);
		}
		if (!opts.method) opts.method = "POST";
	}
	try {
		var res = await fetch(url, <RequestInit>opts);
	} catch (error) {
		throw "Request failed";
	}
	if (res.status === 204) return true;
	const text = await res.text();
	const error = res.status >= 400 || res.status < 200;

	try {
		var json = JSON.parse(text);
	} catch (e) {
		if (error) {
			if (text) throw text;
			throw res.statusText;
		}

		if (opts.res) return { res, body: text };
		return text;
	}

	if (json) {
		console.log(url);
		if (json.error || (json.code && !json.guild) || json.message) throw json;
		if (error) throw json;
	}
	if (error) throw res.statusText;
	if (opts.res) return { res, body: json };
	return json;
}
