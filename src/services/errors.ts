import { QueryFailedError } from "typeorm";
import { UserAlreadyExistsError } from "../errors/user";

function isUniqueViolation(error: QueryFailedError): boolean {
	const driver = error.driverError as { code?: string; number?: number };
	if (driver.code === "23505") return true;
	if (driver.number === 2627 || driver.number === 2601) return true;
	return false;
}

export function rethrowIfUniqueViolation(error: unknown): never {
	if (error instanceof QueryFailedError && isUniqueViolation(error)) {
		throw new UserAlreadyExistsError();
	}
	throw error;
}