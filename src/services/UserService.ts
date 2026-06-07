import type { User } from "../entities/User";
import type { CreateUserInput, UpdateUserInput } from "../types/user-io";
import { UserAlreadyExistsError } from "../errors/user";
import { UserRepository } from "../repositories/UserRepository";
import { rethrowIfUniqueViolation } from "./errors";

export class UserService {
	constructor(private readonly users: UserRepository) {}

	async getUserByEmail(email: string): Promise<User | null> {
		return this.users.findByEmail(email);
	}

	async getAllUsers(): Promise<User[]> {
		return this.users.findAll();
	}

	async createUser(input: CreateUserInput): Promise<User> {
		const existing = await this.users.findByEmail(input.email);
		if (existing) {
			throw new UserAlreadyExistsError();
		}
		try {
			return await this.users.create(input.email);
		} catch (error) {
			rethrowIfUniqueViolation(error);
		}
	}

	async updateUser(id: number, input: UpdateUserInput): Promise<User | null> {
		try {
			return await this.users.update(id, input);
		} catch (error) {
			rethrowIfUniqueViolation(error);
		}
	}

	async deleteUser(id: number): Promise<boolean> {
		return this.users.delete(id);
	}
}