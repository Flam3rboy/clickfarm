import { Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { useEffect, useState } from "react";
import { events } from "../util/events";

export default function Notifications() {
	const [event, setEvent] = useState<any>(null);
	const [timeout, changeTimeout] = useState<any>(null);

	function eventDispatched(action: Event) {
		clearTimeout(timeout);
		console.log("event", action);
		// @ts-ignore
		const data = JSON.parse(action.data);
		var severity = "info";
		switch (data.type) {
			case "ACTION_DONE":
				severity = "success";

				break;
			case "ACTION_ERROR":
			case "error":
				severity = "error";
				break;
			default:
				break;
		}

		setEvent({ ...data, severity });

		changeTimeout(
			setTimeout(() => {
				setEvent(null);
			}, 3000)
		);
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
