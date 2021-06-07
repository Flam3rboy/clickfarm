import { CssBaseline, useMediaQuery } from "@material-ui/core";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Overview from "../pages/Overview";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core/styles";
import React, { useContext } from "react";
import { StoreContext } from "../util/Store";
import Accounts from "../pages/Accounts";

export default function Dashboard() {
	const [context, setContext] = useContext(StoreContext);

	const theme = React.useMemo(
		() =>
			createMuiTheme({
				palette: {
					primary: {
						main: "#ff4545",
					},
					secondary: {
						main: "#ff8252",
					},
					type: context.darkMode ? "dark" : "light",
				},
			}),
		[context.darkMode]
	);

	return (
		<Router>
			<ThemeProvider theme={theme}>
				<div style={{ display: "flex" }}>
					<CssBaseline />
					<Sidebar></Sidebar>

					<main style={{ flexGrow: 1, display: "flex", flexDirection: "column", height: "100%", width: 0 }}>
						<Header></Header>
						<Switch>
							<Route exact path="/" component={Overview}></Route>
							<Route exact path="/accounts" component={Accounts}></Route>
						</Switch>
					</main>
				</div>
			</ThemeProvider>
		</Router>
	);
}
