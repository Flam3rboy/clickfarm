// @ts-nocheck
import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import {
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Dialog,
	Button,
	Accordion,
	AccordionSummary,
	Typography,
	AccordionDetails,
	Checkbox,
	FormControlLabel,
	TextField,
} from "@material-ui/core";
import { Account } from "../../util/types";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { TreeView, TreeItem } from "@material-ui/lab";
import { StoreContext } from "../../util/Store";
import { request } from "../../util/request";

export default function Action({
	open,
	setOpen,
	selected,
}: {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	selected: Account[];
}) {
	const nothingSelected = !selected.length;
	const [context, setContext] = useContext(StoreContext);
	const [workers, setWorkers] = useState<string>(context.workers?.length || 1);
	const [payload, setPayload] = useState<any>(null);

	async function execute() {
		await request(`/workers/`, { method: "PUT", body: { count: workers } });

		const body = { account_ids: selected.map((x) => x.uuid), type: selected.first()?.type, payload };
		console.log(body);

		await request(`/actions/`, {
			method: "POST",
			body,
		});
	}

	return (
		<Dialog maxWidth="xl" open={open} onClose={() => setOpen(false)}>
			<DialogTitle>Action</DialogTitle>
			<DialogContent>
				<DialogContentText>
					{nothingSelected ? (
						"Please select accounts before continuing"
					) : (
						<>{selected.length} Accounts selected</>
					)}
				</DialogContentText>
				{!nothingSelected && (
					<>
						{selected.find((x) => x.type === "discord") && <DiscordAction setPayload={setPayload} />}
						<TextField
							type="number"
							min={1}
							value={workers}
							onChange={(e) => setWorkers(Math.max(e.target.value, 1))}
							label="Thread count"
						/>
					</>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={() => setOpen(false)} color="default">
					Cancel
				</Button>
				<Button onClick={execute} disabled={nothingSelected} variant="contained" color="primary">
					Execute
				</Button>
			</DialogActions>
		</Dialog>
	);
}

function DiscordAction({ setPayload }: { setPayload: Dispatch<SetStateAction<any>> }) {
	const [register, setRegister] = useState(false);
	const [browser, setBrowser] = useState(false);
	const [verifyEmail, setverifyEmail] = useState(false);
	const [invite, setInvite] = useState<string>(null);
	const [uploadDateOfBirth, setUploadDateOfBirth] = useState(false);
	const [uploadAvatar, setUploadAvatar] = useState(false);
	const [connect, setConnect] = useState(false);
	const [updateUser, setUpdateUser] = useState(false);

	useEffect(() => {
		let payload = {
			verifyEmail,
			uploadDateOfBirth,
			uploadAvatar,
			connect,
			updateUser,
		};
		if (register) {
			payload.register = {
				browser,
				invite,
			};
		}

		setPayload(payload);
	}, [register, browser, verifyEmail, invite, uploadDateOfBirth, uploadAvatar, connect, updateUser, setPayload]);

	return (
		<Accordion defaultExpanded>
			<AccordionSummary expandIcon={<ExpandMoreIcon />}>
				<Typography>Discord</Typography>
			</AccordionSummary>
			<AccordionDetails style={{ flexDirection: "column" }}>
				<FormControlLabel
					control={<Checkbox checked={register} onChange={(e) => setRegister(e.target.checked)} />}
					label="Register"
				/>
				{register && (
					<div className="indent">
						<FormControlLabel
							control={<Checkbox checked={browser} onChange={(e) => setBrowser(e.target.checked)} />}
							label="Use browser"
						/>
						<TextField
							size="small"
							value={invite}
							onChange={(e) => setInvite(e.target.value)}
							label="Invite"
						/>
					</div>
				)}
				<FormControlLabel
					control={<Checkbox checked={verifyEmail} onChange={(e) => setverifyEmail(e.target.checked)} />}
					label="Email verify"
				/>
				<FormControlLabel
					control={
						<Checkbox
							checked={uploadDateOfBirth}
							onChange={(e) => setUploadDateOfBirth(e.target.checked)}
						/>
					}
					label="Upload date of birth"
				/>
				<FormControlLabel
					control={<Checkbox checked={uploadAvatar} onChange={(e) => setUploadAvatar(e.target.checked)} />}
					label="Upload avatar"
				/>
				<FormControlLabel
					control={<Checkbox checked={connect} onChange={(e) => setConnect(e.target.checked)} />}
					label="Connect"
				/>
				<FormControlLabel
					control={<Checkbox checked={updateUser} onChange={(e) => setUpdateUser(e.target.checked)} />}
					label="Update User"
				/>
			</AccordionDetails>
		</Accordion>
	);
}
