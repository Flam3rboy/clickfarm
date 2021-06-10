import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export default function AccountType({ onChange }: { onChange: Dispatch<SetStateAction<string>> }) {
	const [value, setValue] = useState("discord");

	useEffect(() => {
		onChange(value);
	}, [value, onChange]);

	return (
		<FormControl>
			<InputLabel>Account Type</InputLabel>
			<Select required value={value} onChange={(e) => setValue(e.target.value as string)}>
				<MenuItem value={"discord"}>Discord</MenuItem>
				<MenuItem value={"twitch"}>Twitch</MenuItem>
			</Select>
		</FormControl>
	);
}
