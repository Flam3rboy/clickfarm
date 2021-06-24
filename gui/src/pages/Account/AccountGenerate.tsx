// @ts-nocheck
import React, { Dispatch, SetStateAction, useContext, useState } from "react";
import {
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Dialog,
	TextField,
	Button,
	CircularProgress,
	Typography,
} from "@material-ui/core";
import AccountType from "../../components/AccountType";
import { request } from "../../util/request";
import { StoreContext } from "../../util/Store";

export default function Generate({ open, setOpen }: { open: boolean; setOpen: Dispatch<SetStateAction<boolean>> }) {
	const [count, setCount] = useState(1);
	const [loading, setLoading] = useState(false);
	const [type, setType] = useState("");
	const [context, setContext] = useContext(StoreContext);
	const [error, setError] = useState("");

	async function sendGenerate() {
		try {
			setLoading(true);
			await request(`/accounts/generate`, {
				body: {
					count,
					type,
				},
			});
			setContext({ accounts: await request(`/accounts`) });
			setOpen(false);
		} catch (e) {
			setError(e.toString());
		} finally {
			setLoading(false);
		}
	}

	return (
		<Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="form-dialog-title">
			<DialogTitle id="form-dialog-title">Generate accounts</DialogTitle>
			<DialogContent>
				<DialogContentText>
					This will just create <strong>dummy</strong> accounts that can be used later to register.
				</DialogContentText>
				<Typography color="red">{error}</Typography>
				<br />
				<div style={{ display: "flex", justifyContent: "space-around" }}>
					<AccountType onChange={setType}></AccountType>
					<TextField
						value={count}
						min={1}
						onChange={(e) => setCount(Math.max(e.target.value, 1))}
						label="Amount"
						type="number"
						variant="outlined"
					/>
				</div>
			</DialogContent>
			<DialogActions>
				<Button onClick={() => setOpen(false)} color="secondary">
					Cancel
				</Button>
				<Button onClick={sendGenerate} variant="contained" color="primary">
					{loading ? <CircularProgress color="secondary" /> : "Generate"}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
