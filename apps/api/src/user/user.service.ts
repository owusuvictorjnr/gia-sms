import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserRole } from "./user.entity";
import * as bcrypt from "bcryptjs"; // Changed from 'bcrypt' to 'bcryptjs'


// The UserService is responsible for managing user-related functionality, such as creating users and finding them by email.
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    // Hash the password before saving
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

  // New method to find all students
  async findAllStudents(): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: UserRole.STUDENT },
      order: { lastName: "ASC", firstName: "ASC" }, // Order them alphabetically
    });
  }
}
