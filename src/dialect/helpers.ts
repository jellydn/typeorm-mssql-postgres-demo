export const isPostgres = (): boolean => {
	return process.env.DB_TYPE === "postgres";
};

export const isMssql = (): boolean => {
	return process.env.DB_TYPE === "mssql";
};

export const getDatabaseType = (): string => {
	return process.env.DB_TYPE || "postgres";
};

export const getConnectionString = (): string => {
	return process.env.DATABASE_URL || "";
};

export const formatDate = (date: Date): string => {
	if (isPostgres()) {
		return date.toISOString();
	}
	return date.toISOString().replace("T", " ").replace("Z", "");
};

export const getLimitClause = (limit: number): string => {
	if (isMssql()) {
		return `TOP ${limit}`;
	}
	return `LIMIT ${limit}`;
};
