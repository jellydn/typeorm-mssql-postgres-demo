import { parseDbType } from "../config/env";

/** Active database driver (from `DB_TYPE`). */
export function getDatabaseType(): string {
	return parseDbType(process.env.DB_TYPE);
}