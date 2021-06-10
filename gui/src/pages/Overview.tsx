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
import React from "react";

export default function Overview() {
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
									24.532
								</Typography>
								<Typography variant="body2" component="p">
									<Chip color="primary" clickable label="+423"></Chip> today
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
									7.94€
								</Typography>
								<Typography variant="body2" component="p">
									<Chip color="primary" clickable label="+492"></Chip> solved
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
