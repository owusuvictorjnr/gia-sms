import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, MoreThanOrEqual, In } from "typeorm";
import { User, UserRole } from "../user/user.entity";
import { Announcement } from "../announcement/announcement.entity";
import {
  Transaction,
  TransactionStatus,
} from "../transaction/transaction.entity";
import { AnnouncementStatus } from "shared-types/src/announcement-status.enum";
import { Invoice, InvoiceStatus } from "../finance/invoice.entity";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Announcement)
    private announcementsRepository: Repository<Announcement>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>
  ) {}

  async getDashboardStats() {
    const totalStudents = await this.usersRepository.count({
      where: { role: UserRole.STUDENT },
    });
    const teachers = await this.usersRepository.count({
      where: { role: UserRole.TEACHER },
    });
    const pendingApprovals = await this.announcementsRepository.count({
      where: { status: AnnouncementStatus.PENDING },
    });

    // Calculate real revenue for today
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to the beginning of the day

    const todaysTransactions = await this.transactionsRepository.find({
      where: {
        status: TransactionStatus.SUCCESSFUL,
        createdAt: MoreThanOrEqual(today),
      },
    });

    const revenueToday = todaysTransactions.reduce(
      (sum, transaction) => sum + parseFloat(transaction.amount.toString()),
      0
    );

    return { totalStudents, teachers, pendingApprovals, revenueToday };
  }

  async getAccountantDashboardStats() {
    const outstandingInvoices = await this.invoicesRepository.count({
      where: {
        status: In([InvoiceStatus.UNPAID, InvoiceStatus.OVERDUE]),
      },
    });

    const { revenueToday } = await this.getDashboardStats();

    return { outstandingInvoices, revenueToday };
  }

  // --- User Management ---

  async findAllUsers(): Promise<User[]> {
    const users = await this.usersRepository.find({
      order: { lastName: "ASC" },
    });
    return users.map(({ password, ...rest }) => rest as User);
  }

  // New method to update a user
  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto
  ): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found.`);
    }

    // Merge the new data into the existing user object
    Object.assign(user, updateUserDto);

    const updatedUser = await this.usersRepository.save(user);
    const { password, ...result } = updatedUser;
    return result as User;
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    const result = await this.usersRepository.delete(userId);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${userId}" not found.`);
    }
    return { message: "User deleted successfully." };
  }

  // --- Other Admin Functions ---

  async searchUsers(role: UserRole, query: string): Promise<User[]> {
    const users = await this.usersRepository.find({
      where: [
        { role, email: Like(`%${query}%`) },
        { role, firstName: Like(`%${query}%`) },
        { role, middleName: Like(`%${query}%`) },
        { role, lastName: Like(`%${query}%`) },
      ],
      take: 10,
    });
    return users.map(({ password, ...rest }) => rest as User);
  }

  async linkParentToChild(parentId: string, childId: string): Promise<User> {
    const parent = await this.usersRepository.findOne({
      where: { id: parentId, role: UserRole.PARENT },
      relations: ["children"],
    });
    const child = await this.usersRepository.findOneBy({
      id: childId,
      role: UserRole.STUDENT,
    });
    if (!parent || !child) {
      throw new NotFoundException("Parent or Child not found.");
    }
    const isAlreadyLinked = parent.children.some((c) => c.id === child.id);
    if (!isAlreadyLinked) {
      parent.children.push(child);
      await this.usersRepository.save(parent);
    }
    const { password, ...result } = parent;
    return result as User;
  }
}
