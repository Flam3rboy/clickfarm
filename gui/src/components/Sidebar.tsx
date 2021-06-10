// @ts-nocheck
import React from "react";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";
import MailIcon from "@material-ui/icons/Mail";
import HomeIcon from "@material-ui/icons/Home";
import AssignmentIcon from "@material-ui/icons/Assignment";
import {
	List,
	ListItem,
	ListItemIcon,
	IconButton,
	Drawer,
	ListItemText,
	AppBar,
	Toolbar,
	SvgIcon,
	Tooltip,
} from "@material-ui/core";
import { useState } from "react";
import { Link as RouterLink, LinkProps as RouterLinkProps } from "react-router-dom";

interface ListItemLinkProps {
	icon?: React.ReactElement;
	primary: string;
	to: string;
	tooltip?: boolean;
}

export function ListItemLink(props: ListItemLinkProps) {
	const { icon, primary, to, tooltip } = props;

	const renderLink = React.useMemo(
		() =>
			React.forwardRef<any, Omit<RouterLinkProps, "to">>((itemProps, ref) => (
				<RouterLink to={to} ref={ref} {...itemProps} />
			)),
		[to]
	);

	const T = tooltip ? Tooltip : ({ children }: any) => <>{children}</>;

	return (
		<li>
			<T title={primary}>
				<ListItem button component={renderLink}>
					{icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
					<ListItemText primary={primary} />
				</ListItem>
			</T>
		</li>
	);
}

export default function Sidebar() {
	const [open, setOpen] = useState(false);

	return (
		<Drawer className={!open ? "MuiDrawer-minimized" : ""} variant="permanent" anchor="left">
			<AppBar position="sticky">
				<Toolbar>
					<IconButton onClick={() => setOpen(!open)} edge="start" className="MuiIconButton-colorInherit">
						{open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
					</IconButton>
				</Toolbar>
			</AppBar>

			<List>
				<ListItemLink tooltip={!open} to="/" primary="Overview" icon={<HomeIcon />} />
				<ListItemLink tooltip={!open} to="/accounts" primary="Accounts" icon={<SupervisorAccountIcon />} />
				<ListItemLink tooltip={!open} to="/emails" primary="Emails" icon={<MailIcon />} />
				<ListItemLink
					tooltip={!open}
					to="/captchas"
					primary="Captchas"
					icon={
						<SvgIcon
							aria-hidden="true"
							focusable="false"
							data-prefix="fas"
							data-icon="robot"
							role="img"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 640 512"
						>
							<path
								fill="currentColor"
								d="M32,224H64V416H32A31.96166,31.96166,0,0,1,0,384V256A31.96166,31.96166,0,0,1,32,224Zm512-48V448a64.06328,64.06328,0,0,1-64,64H160a64.06328,64.06328,0,0,1-64-64V176a79.974,79.974,0,0,1,80-80H288V32a32,32,0,0,1,64,0V96H464A79.974,79.974,0,0,1,544,176ZM264,256a40,40,0,1,0-40,40A39.997,39.997,0,0,0,264,256Zm-8,128H192v32h64Zm96,0H288v32h64ZM456,256a40,40,0,1,0-40,40A39.997,39.997,0,0,0,456,256Zm-8,128H384v32h64ZM640,256V384a31.96166,31.96166,0,0,1-32,32H576V224h32A31.96166,31.96166,0,0,1,640,256Z"
							></path>
						</SvgIcon>
					}
				/>
			</List>
		</Drawer>
	);
}
