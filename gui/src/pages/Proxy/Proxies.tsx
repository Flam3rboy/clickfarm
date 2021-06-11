// @ts-nocheck
import { Button, Card, CardActions, CardContent, Container, Typography } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { useContext, useState } from "react";
import { StoreContext } from "../../util/Store";
import ProxyAdd from "./ProxyAdd";
import ProxyDelete from "./ProxyDelete";

export default function Proxies() {
	const [context, setContext] = useContext(StoreContext);
	const [addPopup, setAddPopup] = useState(false);
	const [deleteProxy, setDeleteProxy] = useState("");

	return (
		<div className="page email">
			<Container maxWidth="md">
				<br />
				<Button onClick={() => setAddPopup(true)} startIcon={<Add />} color="primary" variant="contained">
					Add
				</Button>
				<ProxyAdd open={addPopup} setOpen={setAddPopup}></ProxyAdd>
				<ProxyDelete uuid={deleteProxy} setOpen={setDeleteProxy}></ProxyDelete>

				<div style={{ marginTop: "1rem" }}>
					{(context.proxies || []).map((x) => (
						<Card key={x.uuid}>
							<CardContent>
								<Typography color="textSecondary" gutterBottom></Typography>
								<Typography variant="h5" component="h2">
									{x.type}
								</Typography>
								<Typography color="textSecondary">Size: {x.poolSize}</Typography>
							</CardContent>
							<CardActions>
								<Button
									onClick={((id) => setDeleteProxy(id)).bind(null, x.uuid)}
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
