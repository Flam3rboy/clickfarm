import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { useContext, useState } from "react";
import { request } from "../../util/request";
import { StoreContext } from "../../util/Store";
import Linkify from "react-linkify";

export default function DeleteProxy({ setOpen, uuid }: { setOpen: (value: boolean) => void; uuid: string }) {
	const [context, setContext] = useContext(StoreContext);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<any>();

	async function RemoveProvider() {
		setLoading(true);
		setError(null);
		try {
			const email = await request(`/proxies/${uuid}`, {
				method: "DELETE",
			});

			setContext({ proxies: context.proxies?.filter((x) => x.uuid !== email.uuid) });
			setOpen(false);
		} catch (e) {
			setError(e);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Dialog className="dialog-add-email" maxWidth="xl" open={!!uuid} onClose={() => setOpen(false)}>
			<DialogTitle>Delete Proxy</DialogTitle>
			<DialogContent>
				<DialogContentText>Are you sure you want to delete this proxy?</DialogContentText>

				{error && (
					<Alert severity="error">
						<Linkify>{error}</Linkify>
					</Alert>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={() => setOpen(false)} color="primary">
					Cancel
				</Button>
				<Button disabled={loading} onClick={RemoveProvider} color="primary" autoFocus variant="contained">
					{loading ? <CircularProgress /> : "Delete"}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
