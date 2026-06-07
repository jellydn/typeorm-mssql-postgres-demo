import type { User } from "../entities/User";
import { UserRepository } from "../repositories/UserRepository";

const userRepository = new UserRepository();

export class UserService {
	async getUserByEmail(email: string): Promise<User | null> {
		return userRepository.findByEmail(email);
	}

	async getAllUsers(): Promise<User[]> {
		return userRepository.findAll();
	}

	async createUser(userData: Partial<User>): Promise<User> {
		const existingUser = await userRepository.findByEmail(userData.email || "");
		if (existingUser) {
			throw new Error("User with this email already exists");
		}
		return userRepository.create(userData);
	}

	async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
		return userRepository.update(id, userData);
	}

	async deleteUser(id: number): Promise<boolean> {
		return userRepository.delete(id);
	}
}
