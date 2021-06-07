// @ts-nocheck
import { Button, Link, Typography } from "@material-ui/core";
import { GitHub } from "@material-ui/icons";

export default function Footer() {
	return (
		<Typography component="div" variant="body2" color="textSecondary" align="center">
			<p>Copyright {new Date().getFullYear()} © Flam3rboy - Clickfarm</p>
			<Link underline="none" rel="noopener" href="https://github.com/Flam3rboy/clickfarm" target="_blank">
				<Button startIcon={<GitHub></GitHub>}>GitHub</Button>
			</Link>
		</Typography>
	);
}
