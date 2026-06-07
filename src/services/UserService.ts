import type { User } from "../entities/User";
import { UserRepository } from "../repositories/UserRepository";

let _repo: UserRepository | null = null;
const getRepo = () => {
	if (!_repo) _repo = new UserRepository();
	return _repo;
};

export class UserService {
	async getUserByEmail(email: string): Promise<User | null> {
		return getRepo().findByEmail(email);
	}

	async getAllUsers(): Promise<User[]> {
		return getRepo().findAll();
	}

	async createUser(userData: Partial<User>): Promise<User> {
		const existingUser = await getRepo().findByEmail(userData.email || "");
		if (existingUser) {
			throw new Error("User with this email already exists");
		}
		return getRepo().create(userData);
	}

	async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
		return getRepo().update(id, userData);
	}

	async deleteUser(id: number): Promise<boolean> {
		return getRepo().delete(id);
	}
}
