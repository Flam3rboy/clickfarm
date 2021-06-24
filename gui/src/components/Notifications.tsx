/* eslint-disable no-fallthrough */
import { Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { useContext, useEffect, useState } from "react";
import { events } from "../util/events";
import { StoreContext } from "../util/Store";

export default function Notifications() {
	const [event, setEvent] = useState<any>(null);
	const [timeout, changeTimeout] = useState<any>(null);
	const [context, setContext] = useContext(StoreContext);

	function eventDispatched(action: Event) {
		clearTimeout(timeout);
		// @ts-ignore
		var data = JSON.parse(action.data);
		var clearError = true;
		console.log("event", data);
		var severity = "info";
		switch (data.type) {
			case "ACTION_DONE":
				severity = "success";

				break;
			// @ts-ignore
			case "error":
				clearError = false;
			case "ACTION_ERROR":
				data = { message: JSON.stringify(data.message || data.toString()) };
				severity = "error";
				break;
			case "CAPTCHA_REMOVE":
				setContext({ captcha_tasks: context.captcha_tasks?.filter((x) => x.id !== data.id) });
				return;
			case "CAPTCHA_ADD":
				setContext({ captcha_tasks: [...(context.captcha_tasks || []), data.payload] });
				data = { message: "Captcha needs to be solved" };
				break;
			default:
				break;
		}

		setEvent({ ...data, severity });

		if (clearError) {
			changeTimeout(
				setTimeout(() => {
					setEvent(null);
				}, 3000)
			);
		}
	}

	function onError(error: Event) {
		if (events.readyState) return;
		setEvent({ message: "Connection lost", severity: "error" });
	}

	useEffect(() => {
		events.addEventListener("message", eventDispatched);
		events.addEventListener("error", onError);

		return () => {
			events.removeEventListener("message", eventDispatched);
			events.removeEventListener("error", onError);
		};
	}, []);

	return (
		<div>
			<Snackbar
				anchorOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				onClose={() => setEvent(null)}
				open={!!event}
			>
				<Alert severity={event?.severity}>{event?.message}</Alert>
			</Snackbar>
		</div>
	);
}
