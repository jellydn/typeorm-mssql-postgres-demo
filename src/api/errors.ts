import type { Context } from "hono";
import { UserAlreadyExistsError } from "../errors/user";

export function apiNotFound(c: Context, message = "User not found") {
	return c.json({ error: message }, 404);
}

export function apiBadRequest(c: Context, message: string) {
	return c.json({ error: message }, 400);
}

export function mapServiceErrorToResponse(
	c: Context,
	error: unknown,
): Response {
	if (error instanceof UserAlreadyExistsError) {
		return c.json({ error: "User with this email already exists" }, 409);
	}
	if (error instanceof Error && error.message) {
		return c.json({ error: error.message }, 400);
	}
	return c.json({ error: "Request failed" }, 400);
}