import "reflect-metadata";
import { DataSource } from "typeorm";
import {
	isDbLoggingEnabled,
	isDbSynchronizeEnabled,
	parseDbType,
	requireDatabaseUrl,
} from "./config/env";
import { User } from "./entities/User";

const dbType = parseDbType(process.env.DB_TYPE);

export const AppDataSource = new DataSource({
	type: dbType,
	url: requireDatabaseUrl(),
	synchronize: isDbSynchronizeEnabled(),
	logging: isDbLoggingEnabled(),
	entities: [User],
	extra: dbType === "mssql" ? { trustServerCertificate: true } : {},
});