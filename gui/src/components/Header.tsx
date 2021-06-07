import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { FormControlLabel, Icon, Switch, useMediaQuery } from "@material-ui/core";
import { StoreContext } from "../util/Store";
import { useContext } from "react";

export default function Header() {
	const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
	const [context, setContext] = useContext(StoreContext);

	return (
		<AppBar position="sticky">
			<Toolbar>
				<Typography style={{ flexGrow: 1 }} component="h1" variant="h6" color="inherit" noWrap>
					Clickfarm
				</Typography>
				<FormControlLabel
					label={"Dark Mode"}
					control={
						<Switch
							color="default"
							checked={context.darkMode}
							onChange={() => setContext({ darkMode: !context.darkMode })}
						></Switch>
					}
				></FormControlLabel>
			</Toolbar>
		</AppBar>
	);
}
