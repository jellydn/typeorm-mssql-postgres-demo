import "dotenv/config";
import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { getListenConfig } from "./config/env";
import { AppDataSource } from "./data-source";
import { getDatabaseType } from "./dialect/helpers";
import { UserRepository } from "./repositories/UserRepository";
import { UserService } from "./services/UserService";

async function main(): Promise<void> {
	await AppDataSource.initialize();

	const userService = new UserService(
		UserRepository.fromDataSource(AppDataSource),
	);
	const app = createApp(userService);
	const { port, hostname } = getListenConfig();

	console.log(`Connected to ${getDatabaseType()}`);

	const shutdown = async () => {
		if (AppDataSource.isInitialized) {
			await AppDataSource.destroy();
		}
		process.exit(0);
	};
	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);

	serve({ fetch: app.fetch, port, hostname });
	console.log(`Server running on http://${hostname}:${port}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});