import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User, UserRole } from '../user/user.entity';


// AdminService contains business logic for admin operations
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Search for users by role and name/email
  async searchUsers(role: UserRole, query: string): Promise<User[]> {
    const users = await this.usersRepository.find({
      where: [
        { role, email: Like(`%${query}%`) },
        { role, firstName: Like(`%${query}%`) },
        { role, middleName: Like(`%${query}%`) },
        { role, lastName: Like(`%${query}%`) },
      ],
      take: 10, // Limit results for performance
    });
    return users.map(({ password, ...rest }) => rest as User);
  }

  // Link a parent to a child
  async linkParentToChild(parentId: string, childId: string): Promise<User> {
    const parent = await this.usersRepository.findOne({
      where: { id: parentId, role: UserRole.PARENT },
      relations: ['children'],
    });

    const child = await this.usersRepository.findOneBy({
      id: childId,
      role: UserRole.STUDENT,
    });

    if (!parent || !child) {
      throw new NotFoundException('Parent or Child not found.');
    }

    // Add the child to the parent's list of children if not already linked
    const isAlreadyLinked = parent.children.some(c => c.id === child.id);
    if (!isAlreadyLinked) {
      parent.children.push(child);
      await this.usersRepository.save(parent);
    }

    const { password, ...result } = parent;
    return result as User;
  }
}
