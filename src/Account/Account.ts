import { EmailProvider } from "../Email/EmailProvider";
import { makeid, randomAvatar, randomUsername } from "../util/Util";

const YEAR = 1000 * 60 * 60 * 24 * 365;

export type AccountOptions = {
	emailProvider?: EmailProvider;
	password?: string;
	username?: string;
	avatar?: string;
	dateofbirth?: Date;
};

export abstract class Account {
	public emailProvider?: EmailProvider;
	public password?: string;
	public username?: string;
	public avatar?: string;
	public dateofbirth?: Date;

	constructor(props: AccountOptions) {
		if (!props.dateofbirth) props.dateofbirth = new Date(Date.now() - YEAR * 18 - Math.random() * 40 * YEAR); // random date between 18 and 58
		if (!props.password) props.password = makeid(10);
		if (!props.username) props.username = randomUsername();
		if (!props.avatar) props.avatar = randomAvatar();

		Object.assign(this, props);
	}

	get stringofbirth() {
		if (!this.dateofbirth) return;
		return `${this.dateofbirth.getDate()}.${this.dateofbirth.getMonth() + 1}.${this.dateofbirth.getFullYear()}`;
	}

	get objectofbirth() {
		if (!this.dateofbirth) return;
		return {
			month: this.dateofbirth.getMonth() + 1,
			day: this.dateofbirth.getDate(),
			year: this.dateofbirth.getFullYear(),
		};
	}

	async register() {
		throw new Error("not implemented");
	}
	async login() {
		throw new Error("not implemented");
	}
	async close() {
		throw new Error("not implemented");
	}
}
