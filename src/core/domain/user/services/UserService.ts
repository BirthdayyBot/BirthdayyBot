import type { User, UserCreateInput, UserUpdateInput } from '../User.js';
import type { UserRepository } from '../ports/UserRepository.js';

export class UserService {
	public constructor(private readonly repository: UserRepository) {}

	public async getUser(id: string): Promise<User | null> {
		return this.repository.findById(id);
	}

	public async createUser(data: UserCreateInput): Promise<User> {
		return this.repository.create(data);
	}

	public async updateUser(id: string, data: UserUpdateInput): Promise<User> {
		return this.repository.update(id, data);
	}

	public async deleteUser(id: string): Promise<boolean> {
		return this.repository.delete(id);
	}
}
