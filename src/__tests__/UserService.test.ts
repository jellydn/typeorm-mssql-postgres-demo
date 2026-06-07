import { afterAll, afterEach, beforeAll, describe, expect, it } from "bun:test";
import { AppDataSource } from "../data-source";
import { UserService } from "../services/UserService";

const userService = new UserService();

describe("UserService", () => {
	beforeAll(async () => {
		await AppDataSource.initialize();
	});

	afterAll(async () => {
		await AppDataSource.destroy();
	});

	afterEach(async () => {
		const users = await userService.getAllUsers();
		for (const user of users) {
			await userService.deleteUser(user.id);
		}
	});

	it("should create a user", async () => {
		const user = await userService.createUser({ email: "test@example.com" });
		expect(user).toBeDefined();
		expect(user.email).toBe("test@example.com");
		expect(user.id).toBeDefined();
	});

	it("should find user by email", async () => {
		await userService.createUser({ email: "find@example.com" });
		const user = await userService.getUserByEmail("find@example.com");
		expect(user).toBeDefined();
		expect(user?.email).toBe("find@example.com");
	});

	it("should return all users", async () => {
		await userService.createUser({ email: "all1@example.com" });
		await userService.createUser({ email: "all2@example.com" });
		const users = await userService.getAllUsers();
		expect(Array.isArray(users)).toBe(true);
		expect(users.length).toBe(2);
	});

	it("should update user", async () => {
		const user = await userService.createUser({ email: "update@example.com" });
		const updated = await userService.updateUser(user.id, {
			email: "updated@example.com",
		});
		expect(updated?.email).toBe("updated@example.com");
	});

	it("should delete user", async () => {
		const user = await userService.createUser({ email: "delete@example.com" });
		const deleted = await userService.deleteUser(user.id);
		expect(deleted).toBe(true);

		const found = await userService.getUserByEmail("delete@example.com");
		expect(found).toBeNull();
	});

	it("should not create duplicate emails", async () => {
		await userService.createUser({ email: "duplicate@example.com" });
		await expect(
			userService.createUser({ email: "duplicate@example.com" }),
		).rejects.toThrow("User with this email already exists");
	});
});
