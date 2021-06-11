import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	Select,
	Switch,
	TextField,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { useContext, useState } from "react";
import { request } from "../../util/request";
import { StoreContext } from "../../util/Store";
import Linkify from "react-linkify";

export default function CaptchaAdd({ open, setOpen }: { open: boolean; setOpen: (value: boolean) => void }) {
	const [context, setContext] = useContext(StoreContext);
	const [provider, setProvider] = useState("");
	const [key, setKey] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<any>();

	async function AddProvider() {
		if (!provider) return;

		setLoading(true);
		setError(null);
		try {
			const captcha = await request(`/captchas`, {
				body: {
					service: provider,
					key,
				},
			});
			setContext({ captchas: [...(context.captchas || []), captcha] });
			setOpen(false);
		} catch (e) {
			setError(e);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Dialog className="dialog-add-captcha" maxWidth="xl" open={open} onClose={() => setOpen(false)}>
			<DialogTitle>Add Captcha provider</DialogTitle>
			<DialogContent style={{ display: "flex", flexDirection: "column" }}>
				<FormControl>
					<InputLabel>Captcha Provider</InputLabel>
					<Select value={provider} onChange={(e) => setProvider(e.target.value as string)}>
						<MenuItem value={"2captcha"}>2Captcha</MenuItem>
						<MenuItem value={"anti-captcha"}>AntiCaptcha</MenuItem>
						<MenuItem value={"anti-captcha-trial"}>AntiCaptcha old</MenuItem>
					</Select>
				</FormControl>

				<TextField value={key} onChange={(e) => setKey(e.target.value)} label="API Key"></TextField>

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
				<Button disabled={loading} onClick={AddProvider} color="primary" autoFocus variant="contained">
					{loading ? <CircularProgress /> : "Add"}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
