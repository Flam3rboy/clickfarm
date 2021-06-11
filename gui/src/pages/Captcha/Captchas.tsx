// @ts-nocheck
import { Button, Card, CardActions, CardContent, Container, Typography } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { useContext, useState } from "react";
import { StoreContext } from "../../util/Store";
import CaptchaAdd from "./CaptchaAdd";
import CaptchaDelete from "./CaptchaDelete";

export default function Captcha() {
	const [context, setContext] = useContext(StoreContext);
	const [addPopup, setAddPopup] = useState(false);
	const [deleteCaptcha, setDeleteCaptcha] = useState();

	return (
		<div className="page captchas">
			<Container maxWidth="md">
				<br />
				<Button onClick={() => setAddPopup(true)} startIcon={<Add />} color="primary" variant="contained">
					Add
				</Button>
				<CaptchaAdd open={addPopup} setOpen={setAddPopup}></CaptchaAdd>
				<CaptchaDelete uuid={deleteCaptcha} setOpen={setDeleteCaptcha}></CaptchaDelete>

				<div style={{ marginTop: "1rem" }}>
					{(context.captchas || []).map((x) => (
						<Card key={x.uuid}>
							<CardContent>
								<Typography color="textSecondary" gutterBottom>
									{x.service}
								</Typography>
								<Typography variant="h5" component="h2">
									Balance: ${Number(x.balance).toFixed(2)}
								</Typography>
								<Typography color="textSecondary">Key: {x.key}</Typography>
							</CardContent>
							<CardActions>
								<Button
									onClick={((id) => setDeleteCaptcha(id)).bind(null, x.uuid)}
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
