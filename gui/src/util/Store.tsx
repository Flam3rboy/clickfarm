import React, { createContext, Dispatch, ReactNode, SetStateAction, useState } from "react";
import "missing-native-js-functions";
import { Account } from "./types";

const InitialState: InitalState = {
	darkMode: true,
};

interface InitalState {
	darkMode?: boolean;
	accounts?: Account[];
}

export const StoreContext =
	// @ts-ignore
	createContext<(InitialState | Dispatch<SetStateAction<InitialState>>)[]>(null);

export const Store = ({ children }: { children: ReactNode }) => {
	const [state, setState] = useState(InitialState);

	function set(value: any) {
		if (typeof value !== "object") return;
		setState({ ...value.merge(state) });
	}

	return <StoreContext.Provider value={[state, set]}>{children}</StoreContext.Provider>;
};
