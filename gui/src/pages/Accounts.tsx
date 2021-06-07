// @ts-nocheck
import { CircularProgress, Toolbar } from "@material-ui/core";
import { useContext, useEffect } from "react";
import { request } from "../util/request";
import { StoreContext } from "../util/Store";
import { DataGrid, GridRowsProp, GridColDef } from "@material-ui/data-grid";
import AppBar from "@material-ui/core/AppBar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";

const rows: GridRowsProp = [
	{ id: 1, col1: "Hello", col2: "World" },
	{ id: 2, col1: "XGrid", col2: "is Awesome" },
	{ id: 3, col1: "Material-UI", col2: "is Amazing" },
];

const columns: GridColDef[] = [
	{ field: "col1", headerName: "Column 1", width: 150 },
	{ field: "col2", headerName: "Column 2", width: 150 },
];

export default function Accounts() {
	const [context, setContext] = useContext(StoreContext);

	useEffect(() => {
		async function fetchAccounts() {
			const accounts = await request(`/accounts`);
			setContext({ accounts });
		}

		fetchAccounts();
	}, []);

	console.log(context.accounts);

	if (!context.accounts)
		return (
			<div style={{ display: "flex", justifyContent: "center", margin: "2rem 0" }}>
				<CircularProgress />
			</div>
		);

	return (
		<div className="page accounts">
			<Toolbar className="toolbar">
				<Button>Insert</Button>
				<Button>Generate</Button>
				<Button>Export</Button>
				<Button>Export</Button>
				<Button>Export</Button>
			</Toolbar>
			<DataGrid rows={rows} columns={columns} />
		</div>
	);
}
