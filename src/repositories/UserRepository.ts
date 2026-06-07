import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

let _repo: ReturnType<typeof AppDataSource.getRepository<User>> | null = null;
const getRepo = () => {
	if (!_repo) _repo = AppDataSource.getRepository(User);
	return _repo;
};

export class UserRepository {
	async findByEmail(email: string): Promise<User | null> {
		return getRepo().findOneBy({ email });
	}

	async findAll(): Promise<User[]> {
		return getRepo().find();
	}

	async create(userData: Partial<User>): Promise<User> {
		const user = getRepo().create(userData);
		return getRepo().save(user);
	}

	async update(id: number, userData: Partial<User>): Promise<User | null> {
		await getRepo().update(id, userData);
		return getRepo().findOneBy({ id });
	}

	async delete(id: number): Promise<boolean> {
		const result = await getRepo().delete(id);
		return (
			result.affected !== null &&
			result.affected !== undefined &&
			result.affected > 0
		);
	}
}
