// @ts-nocheck
import { Button, Card, CardActions, CardContent, Container, Typography } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { useContext, useState } from "react";
import { InitalStateContext, StoreContext } from "../../util/Store";
import AddEmail from "./AddEmail";

export default function Email() {
	const [context, setContext] = useContext(StoreContext);
	const [addPopup, openAdd] = useState(false);

	return (
		<div className="page email">
			<Container maxWidth="md">
				<br />
				<Button onClick={() => openAdd(true)} startIcon={<Add />} color="primary" variant="contained">
					Add
				</Button>
				<AddEmail open={addPopup} setOpen={openAdd}></AddEmail>

				<div style={{ marginTop: "1rem" }}>
					{(context.emails || []).map((x) => (
						<Card>
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
									Secure: {x.secure}
								</Typography>
							</CardContent>
							<CardActions>
								<Button size="small" color="primary">
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
