import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	TextareaAutosize,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { useContext, useState } from "react";
import { request } from "../../util/request";
import { StoreContext } from "../../util/Store";
import Linkify from "react-linkify";

export default function AddProxy({ open, setOpen }: { open: boolean; setOpen: (value: boolean) => void }) {
	const [context, setContext] = useContext(StoreContext);
	const [provider, setProvider] = useState("list");
	const [poolSize, setPoolSize] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<any>();
	const [list, setList] = useState("");

	async function AddProvider() {
		if (!provider) return;

		setLoading(true);
		setError(null);
		try {
			const body: any = {
				type: provider,
				poolSize,
			};
			if (list) {
				body.list = list.split("\n");
				body.poolSize = body.list.length;
			}
			const proxy = await request(`/proxies`, {
				body,
			});
			setContext({ proxies: [...(context.proxies || []), proxy] });
			setOpen(false);
		} catch (e) {
			setError(e);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Dialog className="dialog-add-email" maxWidth="xl" open={open} onClose={() => setOpen(false)}>
			<DialogTitle>Add Proxies</DialogTitle>
			<DialogContent style={{ display: "flex", flexDirection: "column" }}>
				<FormControl>
					<InputLabel>Proxy type</InputLabel>
					<Select value={provider} onChange={(e) => setProvider(e.target.value as string)}>
						<MenuItem value={"list"}>Proxy list</MenuItem>
						<MenuItem value={"tor"}>TOR</MenuItem>
						<MenuItem value={"huawei-lte"}>Huawei LTE Stick</MenuItem>
					</Select>
				</FormControl>

				{provider === "list" ? (
					<TextareaAutosize
						value={list}
						onChange={(e) => setList(e.target.value)}
						rowsMin={3}
						placeholder="http://localhost:8080"
					/>
				) : (
					<TextField
						value={poolSize}
						onChange={(e) => setPoolSize(Math.max(Number(e.target.value), 1))}
						type="number"
						label="Amount"
					></TextField>
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
