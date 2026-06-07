import type { DataSource, Repository } from "typeorm";
import { User } from "../entities/User";
import type { UpdateUserInput } from "../types/user-io";

export class UserRepository {
	constructor(private readonly repo: Repository<User>) {}

	static fromDataSource(dataSource: DataSource): UserRepository {
		return new UserRepository(dataSource.getRepository(User));
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.repo.findOneBy({ email });
	}

	async findAll(): Promise<User[]> {
		return this.repo.find();
	}

	async create(email: string): Promise<User> {
		const user = this.repo.create({ email });
		return this.repo.save(user);
	}

	async update(id: number, input: UpdateUserInput): Promise<User | null> {
		if (input.email !== undefined) {
			await this.repo.update(id, { email: input.email });
		}
		return this.repo.findOneBy({ id });
	}

	async delete(id: number): Promise<boolean> {
		const result = await this.repo.delete(id);
		return (result.affected ?? 0) > 0;
	}
}