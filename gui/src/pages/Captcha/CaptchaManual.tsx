import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useContext } from "react";
import { StoreContext } from "../../util/Store";
import { CircularProgress } from "@material-ui/core";
import { request } from "../../util/request";

export default function CaptchaManual() {
	const [context, setContext] = useContext(StoreContext);

	if (!context.captcha_tasks) return <CircularProgress></CircularProgress>;

	async function solve(id: string, token: string) {
		await request("/captchas/solve/", {
			body: {
				token,
				id,
			},
		});
		setContext({ captcha_tasks: context.captcha_tasks?.filter((x) => x.id !== id) });
	}

	return context.captcha_tasks.map((x) => {
		switch (x.type) {
			case "hcaptcha":
				return (
					<HCaptcha
						sitekey={x.key}
						onVerify={((id: string, token: string) => solve(id, token)).bind(null, x.id)}
					></HCaptcha>
				);
		}
	});
}
