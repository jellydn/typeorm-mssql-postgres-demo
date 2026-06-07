import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { AppDataSource } from "./data-source";
import { getDatabaseType } from "./dialect/helpers";
import { UserService } from "./services/UserService";

const app = new Hono();
const userService = new UserService();

app.get("/", (c) => c.text("Hello Hono + TypeORM!"));

app.get("/users", async (c) => {
	const users = await userService.getAllUsers();
	return c.json(users);
});

app.get("/users/:email", async (c) => {
	const email = c.req.param("email");
	const user = await userService.getUserByEmail(email);
	if (!user) {
		return c.json({ error: "User not found" }, 404);
	}
	return c.json(user);
});

app.post("/users", async (c) => {
	try {
		const body = await c.json();
		const user = await userService.createUser(body);
		return c.json(user, 201);
	} catch (error) {
		return c.json({ error: (error as Error).message }, 400);
	}
});

app.patch("/users/:id", async (c) => {
	const id = parseInt(c.req.param("id"));
	const body = await c.json();
	const user = await userService.updateUser(id, body);
	if (!user) {
		return c.json({ error: "User not found" }, 404);
	}
	return c.json(user);
});

app.delete("/users/:id", async (c) => {
	const id = parseInt(c.req.param("id"));
	const deleted = await userService.deleteUser(id);
	if (!deleted) {
		return c.json({ error: "User not found" }, 404);
	}
	return c.json({ success: true });
});

app.get("/health", (c) => {
	return c.json({ status: "ok", database: getDatabaseType() });
});

AppDataSource.initialize()
	.then(() => {
		console.log(`Connected to ${getDatabaseType()}`);
		serve({ fetch: app.fetch, port: 3000 });
		console.log("Server running on http://localhost:3000");
	})
	.catch((err) => console.error(err));
