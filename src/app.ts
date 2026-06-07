import { Hono } from "hono";
import {
	apiBadRequest,
	apiNotFound,
	mapServiceErrorToResponse,
} from "./api/errors";
import {
	parseCreateUserBody,
	parseUpdateUserBody,
	parseUserId,
} from "./api/user-input";
import { getDatabaseType } from "./dialect/helpers";
import type { UserService } from "./services/UserService";

export function createApp(userService: UserService): Hono {
	const app = new Hono();

	app.get("/", (c) => c.text("Hello Hono + TypeORM!"));

	app.get("/users", async (c) => {
		const users = await userService.getAllUsers();
		return c.json(users);
	});

	app.get("/users/:email", async (c) => {
		const email = c.req.param("email");
		const user = await userService.getUserByEmail(email);
		if (!user) {
			return apiNotFound(c);
		}
		return c.json(user);
	});

	app.post("/users", async (c) => {
		let body: unknown;
		try {
			body = await c.req.json();
		} catch {
			return apiBadRequest(c, "Invalid JSON body");
		}
		const parsed = parseCreateUserBody(body);
		if (typeof parsed === "string") {
			return apiBadRequest(c, parsed);
		}
		try {
			const user = await userService.createUser(parsed);
			return c.json(user, 201);
		} catch (error) {
			return mapServiceErrorToResponse(c, error);
		}
	});

	app.patch("/users/:id", async (c) => {
		const id = parseUserId(c.req.param("id"));
		if (id === null) {
			return apiBadRequest(c, "id must be a positive integer");
		}
		let body: unknown;
		try {
			body = await c.req.json();
		} catch {
			return apiBadRequest(c, "Invalid JSON body");
		}
		const parsed = parseUpdateUserBody(body);
		if (typeof parsed === "string") {
			return apiBadRequest(c, parsed);
		}
		try {
			const user = await userService.updateUser(id, parsed);
			if (!user) {
				return apiNotFound(c);
			}
			return c.json(user);
		} catch (error) {
			return mapServiceErrorToResponse(c, error);
		}
	});

	app.delete("/users/:id", async (c) => {
		const id = parseUserId(c.req.param("id"));
		if (id === null) {
			return apiBadRequest(c, "id must be a positive integer");
		}
		const deleted = await userService.deleteUser(id);
		if (!deleted) {
			return apiNotFound(c);
		}
		return c.json({ success: true });
	});

	app.get("/health", (c) => {
		return c.json({ status: "ok", database: getDatabaseType() });
	});

	return app;
}