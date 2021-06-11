export async function request(path: string, options?: any) {
	if (!options) options = {};
	if (!options.headers) options.headers = {};
	if (options.body && typeof options.body === "object") {
		options.body = JSON.stringify(options.body);
		// @ts-ignore
		options.headers["content-type"] = "application/json";
	}
	if (options.body && !options.method) options.method = "POST";

	const response = await fetch(`http://localhost:4932${path}`, options);
	var json: any = await response.text();
	try {
		json = JSON.parse(json);
	} catch (e) {
		throw json;
	}
	if (response.status !== 200) throw json.message;

	return json;
}
