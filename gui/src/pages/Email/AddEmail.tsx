import {
	Button,
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
import { useState } from "react";
import { Email } from "../../util/types";

export default function Add({ open, setOpen }: { open: boolean; setOpen: (value: boolean) => void }) {
	const [provider, setProvider] = useState("");
	const [secure, setSecure] = useState(false);

	return (
		<Dialog maxWidth="xl" open={open} onClose={() => setOpen(false)}>
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

				<TextField label="Username"></TextField>
				<TextField label="Password"></TextField>
				{provider === "imap" && (
					<>
						<TextField label="Domain"></TextField>
						<TextField label="Host"></TextField>
						<TextField label="Port"></TextField>
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
			</DialogContent>
			<DialogActions>
				<Button onClick={() => setOpen(false)} color="primary">
					Cancel
				</Button>
				<Button onClick={() => {}} color="primary" autoFocus variant="contained">
					Add
				</Button>
			</DialogActions>
		</Dialog>
	);
}
