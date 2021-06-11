import {
	Button,
	Card,
	CardActions,
	CardContent,
	Chip,
	Container,
	GridList,
	GridListTile,
	Typography,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import React, { useContext } from "react";
import { StoreContext } from "../util/Store";

export default function Overview() {
	const [context, setContext] = useContext(StoreContext);

	const accounts = (context.accounts || []).filter((x) => x.status !== "notregistered");
	// @ts-ignore
	const accounts_today = accounts.filter((x) => x.created_at > new Date().setHours(0, 0, 0, 0));
	const captcha_balance = context.captchas?.reduce((total, x) => total + (x.balance || 0), 0) || 0;

	return (
		<>
			<Container maxWidth="md">
				<GridList cellHeight="auto" cols={3}>
					<GridListTile>
						<Card>
							<CardContent>
								<Typography color="textSecondary" gutterBottom>
									Accounts
								</Typography>
								<Typography variant="h5" component="h2">
									{accounts.length}
								</Typography>
								<Typography variant="body2" component="p">
									<Chip color="primary" clickable label={`+${accounts_today.length}`}></Chip> today
								</Typography>
							</CardContent>
							<CardActions>
								<Link to="/accounts" className="MuiLink-underlineNone">
									<Button color="primary" size="small">
										Manage
									</Button>
								</Link>
							</CardActions>
						</Card>
					</GridListTile>

					<GridListTile>
						<Card>
							<CardContent>
								<Typography color="textSecondary" gutterBottom>
									Captchas
								</Typography>
								<Typography variant="h5" component="h2">
									${captcha_balance?.toFixed(2)}
								</Typography>
								<Typography variant="body2" component="p">
									<Chip color="primary" clickable label={`+${context.captchas_solved || 0}`}></Chip>{" "}
									solved
								</Typography>
							</CardContent>
							<CardActions>
								<Link to="/captchas" className="MuiLink-underlineNone">
									<Button color="primary" size="small">
										Manage
									</Button>
								</Link>
							</CardActions>
						</Card>
					</GridListTile>
				</GridList>
			</Container>

			<Footer></Footer>
		</>
	);
}
