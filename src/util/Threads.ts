const MAX_ERRORS = 3;
import fs from "fs/promises";
import path from "path";

export function createThreads(threads = 1, callback: () => any) {
	var errorCount = 0;

	for (let i = 0; i < threads; i++) {
		setTimeout(async () => {
			while (true) {
				try {
					const result = await callback();

					if (result && typeof result === "string") {
						await fs.appendFile(
							path.join(__dirname, "/../../assets/Lists/result.txt"),
							result + "\n",
							"utf8"
						);
					}
				} catch (error) {
					errorCount++;
				}
				if (errorCount >= MAX_ERRORS) return;
			}
		}, 0);
	}

	return {
		stop() {
			errorCount = MAX_ERRORS;
		},
	};
}
