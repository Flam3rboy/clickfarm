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

export default function AddEmail({ open, setOpen }: { open: boolean; setOpen: (value: boolean) => void }) {
	const [context, setContext] = useContext(StoreContext);
	const [secure, setSecure] = useState(true);
	const [provider, setProvider] = useState("gmail");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [host, setHost] = useState("");
	const [port, setPort] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<any>();

	async function AddProvider() {
		if (!provider) return;

		setLoading(true);
		setError(null);
		try {
			const result = await request(`/emails`, {
				body: {
					type: provider,
					secure,
					email,
					password,
					host,
					port,
				},
			});
			setContext({ emails: [...(context.emails || []), result] });
			setOpen(false);
		} catch (e) {
			setError(e);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Dialog className="dialog-add-email" maxWidth="xl" open={open} onClose={() => setOpen(false)}>
			<DialogTitle>Add Email provider</DialogTitle>
			<DialogContent style={{ display: "flex", flexDirection: "column" }}>
				<FormControl>
					<InputLabel>Email Provider</InputLabel>
					<Select value={provider} onChange={(e) => setProvider(e.target.value as string)}>
						<MenuItem value={"gmail"}>
							<img
								alt=""
								width="30"
								src="https://logosmarken.com/wp-content/uploads/2020/11/Gmail-Logo.png"
							></img>
							Gmail
						</MenuItem>
						<MenuItem value={"imap"}>Imap</MenuItem>
					</Select>
				</FormControl>

				<TextField value={email} onChange={(e) => setEmail(e.target.value)} label="Email"></TextField>
				<TextField
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					type="password"
					label="Password"
				></TextField>
				{provider === "imap" && (
					<>
						<TextField value={host} onChange={(e) => setHost(e.target.value)} label="Host"></TextField>
						<TextField value={port} onChange={(e) => setPort(e.target.value)} label="Port"></TextField>
						<FormControlLabel
							control={
								<Switch
									checked={secure}
									onChange={(e) => setSecure(e.target.checked)}
									name="secure"
									color="primary"
								/>
							}
							label="Use TLS"
						/>
					</>
				)}

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
