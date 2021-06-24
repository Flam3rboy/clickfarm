import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useMediaQuery, Box, LinearProgress } from "@material-ui/core";
import { StoreContext } from "../util/Store";
import { useContext } from "react";

export default function Header() {
	const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
	const [context, setContext] = useContext(StoreContext);

	const total = context.actions?.length || 0;
	const errors = context.actions?.filter((x) => x.status === "error").length || 0;
	const inwork = context.actions?.filter((x) => x.status === "inwork").length || 0;
	const done = context.actions?.filter((x) => x.status === "done").length || 0;
	const percentage = (total / (done + errors)) * 100;
	const percentageBuffer = (total / (inwork + done)) * 100;

	return (
		<AppBar position="sticky">
			<Toolbar>
				<Typography component="h1" variant="h6" color="inherit" noWrap>
					Clickfarm
				</Typography>
				{context.actions && (
					<Box
						className="action-progress"
						style={{ flexGrow: 1, margin: "0", height: "56px" }}
						display="flex"
						alignItems="center"
					>
						<Box width="100%" mr={1}>
							<LinearProgress
								color="secondary"
								variant="determinate"
								value={percentage}
								valueBuffer={percentageBuffer}
							/>
						</Box>
						<Box className="status" minWidth={90} alignItems="start" alignSelf="start" fontSize="10px">
							<div>Concurrent: {inwork}</div>
							<div>Errors: {errors}</div>
							<div>Done: {done}</div>
							<div>Total: {total}</div>
						</Box>
					</Box>
				)}
			</Toolbar>
		</AppBar>
	);
}
