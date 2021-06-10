import { CssBaseline } from "@material-ui/core";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Overview from "../pages/Overview";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core/styles";
import React, { useContext, useEffect } from "react";
import { StoreContext } from "../util/Store";
import Accounts from "../pages/Account/Accounts";
import { request } from "../util/request";
import Notifications from "./Notifications";
import Email from "../pages/Email/Email";

export default function Dashboard() {
	const [context, setContext] = useContext(StoreContext);
	// @ts-ignore
	window.context = context;

	const theme = React.useMemo(
		() =>
			createMuiTheme({
				palette: {
					primary: {
						main: "#ff4545",
					},
					secondary: {
						main: context.darkMode ? "#c2c2c2" : "#808080",
					},
					type: context.darkMode ? "dark" : "light",
				},
			}),
		[context.darkMode]
	);

	useEffect(() => {
		request(`/accounts`).then((accounts) => setContext({ accounts }));
		request(`/workers`).then((workers) => setContext({ workers }));
	}, []);

	return (
		<Router>
			<ThemeProvider theme={theme}>
				<div style={{ display: "flex" }}>
					<CssBaseline />
					<Sidebar></Sidebar>
					<Notifications />

					<main style={{ flexGrow: 1, display: "flex", flexDirection: "column", height: "100%", width: 0 }}>
						<Header></Header>
						<Switch>
							<Route exact path="/" component={Overview}></Route>
							<Route exact path="/accounts" component={Accounts}></Route>
							<Route exact path="/emails" component={Email}></Route>
						</Switch>
					</main>
				</div>
			</ThemeProvider>
		</Router>
	);
}
