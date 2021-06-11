// @ts-nocheck
import { Button, Card, CardActions, CardContent, Container, Typography } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { useContext, useState } from "react";
import { StoreContext } from "../../util/Store";
import EmailAdd from "./EmailAdd";
import EmailDelete from "./EmailDelete";

export default function Email() {
	const [context, setContext] = useContext(StoreContext);
	const [addPopup, setAddPopup] = useState(false);
	const [deleteEmail, setDeleteEmail] = useState("");

	return (
		<div className="page email">
			<Container maxWidth="md">
				<br />
				<Button onClick={() => setAddPopup(true)} startIcon={<Add />} color="primary" variant="contained">
					Add
				</Button>
				<EmailAdd open={addPopup} setOpen={setAddPopup}></EmailAdd>
				<EmailDelete uuid={deleteEmail} setOpen={setDeleteEmail}></EmailDelete>

				<div style={{ marginTop: "1rem" }}>
					{(context.emails || []).map((x) => (
						<Card key={x.uuid}>
							<CardContent>
								<Typography color="textSecondary" gutterBottom>
									{x.type}
								</Typography>
								<Typography variant="h5" component="h2">
									{x.username}
								</Typography>
								<Typography color="textSecondary">
									{x.host}:{x.port}
									<br />
									Secure: {x.secure ? "true" : "false"}
								</Typography>
							</CardContent>
							<CardActions>
								<Button
									onClick={((id) => setDeleteEmail(id)).bind(null, x.uuid)}
									size="small"
									color="primary"
								>
									Delete
								</Button>
							</CardActions>
						</Card>
					))}
				</div>
			</Container>
		</div>
	);
}
