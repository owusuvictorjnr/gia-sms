import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, Not } from "typeorm";
import { User, UserRole } from "./user.entity";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const newUser = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
    });
    return this.usersRepository.save(newUser);
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findAllStudents(): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: UserRole.STUDENT },
      order: { lastName: "ASC", firstName: "ASC" },
    });
  }

  // New method for general user search
  async searchAllUsers(query: string, currentUserId: string): Promise<User[]> {
    const users = await this.usersRepository.find({
      where: [
        { id: Not(currentUserId), email: Like(`%${query}%`) },
        { id: Not(currentUserId), firstName: Like(`%${query}%`) },
        { id: Not(currentUserId), middleName: Like(`%${query}%`) },
        { id: Not(currentUserId), lastName: Like(`%${query}%`) },
      ],
      take: 10,
    });
    // Map the data to exclude sensitive information
    return users.map(({ password, ...rest }) => rest as User);
  }
}
