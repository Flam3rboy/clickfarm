import React, { createContext, Dispatch, ReactNode, SetStateAction, useState } from "react";
import "missing-native-js-functions";
import { Account, Worker, Email, Captcha, Proxy, Action } from "./types";

const InitialState: InitalStateContext = {
	darkMode: true,
};

export interface InitalStateContext {
	darkMode?: boolean;
	accounts?: Account[];
	workers?: Worker[];
	emails?: Email[];
	actions?: Action[];
	captchas?: Captcha[];
	proxies?: Proxy[];
	captchas_solved?: number;
	captcha_tasks?: {
		type: string;
		url: string;
		key: string;
		id: string;
	}[];
}

// @ts-ignore
export const StoreContext = createContext<[InitalStateContext, Dispatch<SetStateAction<InitalStateContext>>]>(null);

export const Store = ({ children }: { children: ReactNode }) => {
	const [state, setState] = useState(InitialState);

	function set(value: any) {
		if (typeof value !== "object") return;
		setState({ ...value.merge(state) });
	}

	return <StoreContext.Provider value={[state, set]}>{children}</StoreContext.Provider>;
};
