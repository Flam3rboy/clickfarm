// @ts-nocheck
import { Toolbar } from "@material-ui/core";
import { useContext, useState } from "react";
import { StoreContext } from "../../util/Store";
import MaterialTable from "@material-table/core";
import Button from "@material-ui/core/Button";
import Action from "./Action";
import Generate from "./Generate";

export default function Accounts() {
	const [context] = useContext(StoreContext);
	const [actionOpen, setActionOpen] = useState(false);
	const [generateOpen, setGenerateOpen] = useState(false);
	const [selected, setSelected] = useState([]);

	return (
		<div className="page accounts">
			<Toolbar className="toolbar">
				<Button>Insert</Button>
				<Button>Export</Button>
				<Button onClick={() => setGenerateOpen(true)}>Generate</Button>
				<Button onClick={() => setActionOpen(true)}>Action</Button>
			</Toolbar>
			<Action selected={selected} open={actionOpen} setOpen={setActionOpen}></Action>
			<Generate open={generateOpen} setOpen={setGenerateOpen}></Generate>
			<MaterialTable
				style={{ overflow: "auto" }}
				options={{
					selection: true,
					filtering: true,
					pageSize: 20,
				}}
				onSelectionChange={(s) => setSelected(s)}
				isLoading={!context.accounts}
				title="Accounts"
				data={context.accounts}
				columns={[
					{ field: "uuid", title: "ID", filtering: false },
					{ field: "type", title: "Type", lookup: getLookup(context.accounts, (x) => x.type) },
					{
						field: "status",
						title: "Status",
						lookup: getLookup(context.accounts, (x) => x.status),
					},
				]}
			/>
		</div>
	);
}

function getLookup(accounts: Account[], callback: (account: Account) => string) {
	return Object.fromEntries(
		(accounts || [])
			.map(callback)
			.unique()
			.map((x) => [x, x])
	);
}
