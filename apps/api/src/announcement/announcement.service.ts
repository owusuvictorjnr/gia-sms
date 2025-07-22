import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Announcement } from "./announcement.entity";
import { CreateAnnouncementDto } from "./dto/create-announcement.dto";
import { User } from "../user/user.entity";
import { Class } from "../class/class.entity";
import { AnnouncementStatus } from "shared-types/src/announcement-status.enum";


// This service handles the business logic for announcements, including creation, retrieval, and status updates.
@Injectable()
export class AnnouncementService {
  constructor(
    @InjectRepository(Announcement)
    private announcementsRepository: Repository<Announcement>,
    @InjectRepository(Class)
    private classesRepository: Repository<Class>
  ) {}

  async create(
    createDto: CreateAnnouncementDto,
    author: any
  ): Promise<Announcement> {
    const targetClasses = await this.classesRepository.findBy({
      id: In(createDto.classIds),
    });

    if (targetClasses.length !== createDto.classIds.length) {
      throw new NotFoundException("One or more classes not found.");
    }

    const newAnnouncement = this.announcementsRepository.create({
      title: createDto.title,
      content: createDto.content,
      authorId: author.userId,
      status: AnnouncementStatus.PENDING,
      classes: targetClasses,
    });
    return this.announcementsRepository.save(newAnnouncement);
  }

  async findPending(): Promise<Announcement[]> {
    return this.announcementsRepository.find({
      where: { status: AnnouncementStatus.PENDING },
      relations: ["author", "classes"],
      order: { createdAt: "DESC" },
    });
  }

  async updateStatus(
    id: string,
    status: AnnouncementStatus,
    admin: any
  ): Promise<Announcement> {
    const announcement = await this.announcementsRepository.findOneBy({ id });
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID "${id}" not found`);
    }

    announcement.status = status;
    if (status === AnnouncementStatus.APPROVED) {
      announcement.approvedById = admin.userId;
    }

    return this.announcementsRepository.save(announcement);
  }

  async findAllApproved(): Promise<Announcement[]> {
    return this.announcementsRepository.find({
      where: { status: AnnouncementStatus.APPROVED },
      relations: ["author", "classes"],
      order: { createdAt: "DESC" },
    });
  }
}
