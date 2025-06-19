import type { User, UserCreateInput, UserUpdateInput } from '../User.js';

export interface UserRepository {
	findById(id: string): Promise<User | null>;
	create(data: UserCreateInput): Promise<User>;
	update(id: string, data: UserUpdateInput): Promise<User>;
	delete(id: string): Promise<boolean>;
}
