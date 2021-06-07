export interface ProxyConfig {
	type: ProxyType;
	uuid: string;
	poolSize: number;
	entries?: string[];
}

export type ProxyType = "list" | "tor" | "huawei-lte";
