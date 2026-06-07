export type DbType = "postgres" | "mssql";

export function parseDbType(raw: string | undefined): DbType {
	const value = (raw ?? "postgres").trim().toLowerCase();
	if (value === "postgres" || value === "mssql") {
		return value;
	}
	throw new Error(
		`Invalid DB_TYPE "${raw ?? ""}". Expected "postgres" or "mssql".`,
	);
}

export function requireDatabaseUrl(): string {
	const url = process.env.DATABASE_URL?.trim();
	if (!url) {
		throw new Error("DATABASE_URL is required.");
	}
	return url;
}

export function isDbSynchronizeEnabled(): boolean {
	if (process.env.DB_SYNC === "true") return true;
	if (process.env.DB_SYNC === "false") return false;
	return process.env.NODE_ENV !== "production";
}

export function isDbLoggingEnabled(): boolean {
	if (process.env.DB_LOGGING === "true") return true;
	if (process.env.DB_LOGGING === "false") return false;
	return process.env.NODE_ENV !== "production";
}

export function getListenConfig(): { port: number; hostname: string } {
	const port = Number.parseInt(process.env.PORT ?? "3000", 10);
	if (!Number.isFinite(port) || port < 1) {
		throw new Error(`Invalid PORT "${process.env.PORT ?? ""}".`);
	}
	return {
		port,
		hostname: process.env.HOST ?? "0.0.0.0",
	};
}