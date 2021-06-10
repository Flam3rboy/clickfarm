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

				{(context.emails || []).map((x) => (
					<Card>
						<CardContent>
							<Typography color="textSecondary" gutterBottom>
								Word of the Day
							</Typography>
							<Typography variant="h5" component="h2">
								be nev o lent
							</Typography>
							<Typography color="textSecondary">adjective</Typography>
							<Typography variant="body2" component="p">
								well meaning and kindly.
								<br />
								{'"a benevolent smile"'}
							</Typography>
						</CardContent>
						<CardActions>
							<Button size="small">Learn More</Button>
						</CardActions>
					</Card>
				))}
			</Container>
		</div>
	);
}
