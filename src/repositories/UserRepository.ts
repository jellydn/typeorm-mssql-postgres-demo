import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

const userRepository = AppDataSource.getRepository(User);

export class UserRepository {
	async findByEmail(email: string): Promise<User | null> {
		return userRepository.findOneBy({ email });
	}

	async findAll(): Promise<User[]> {
		return userRepository.find();
	}

	async create(userData: Partial<User>): Promise<User> {
		const user = userRepository.create(userData);
		return userRepository.save(user);
	}

	async update(id: number, userData: Partial<User>): Promise<User | null> {
		await userRepository.update(id, userData);
		return userRepository.findOneBy({ id });
	}

	async delete(id: number): Promise<boolean> {
		const result = await userRepository.delete(id);
		return (
			result.affected !== null &&
			result.affected !== undefined &&
			result.affected > 0
		);
	}
}
