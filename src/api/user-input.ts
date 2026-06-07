import type { CreateUserInput, UpdateUserInput } from "../types/user-io";

export type { CreateUserInput, UpdateUserInput };

function parseEmail(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const email = value.trim();
	if (email.length === 0 || !email.includes("@")) return null;
	return email;
}

export function parseUserId(raw: string): number | null {
	if (!/^[1-9]\d*$/.test(raw.trim())) return null;
	return Number.parseInt(raw, 10);
}

export function parseCreateUserBody(body: unknown): CreateUserInput | string {
	if (body === null || typeof body !== "object") {
		return "Request body must be a JSON object";
	}
	const email = parseEmail((body as { email?: unknown }).email);
	if (!email) return "email must be a non-empty string containing @";
	return { email };
}

export function parseUpdateUserBody(body: unknown): UpdateUserInput | string {
	if (body === null || typeof body !== "object") {
		return "Request body must be a JSON object";
	}
	const record = body as { email?: unknown };
	if (record.email === undefined) {
		return {};
	}
	const email = parseEmail(record.email);
	if (!email) return "email must be a non-empty string containing @";
	return { email };
}