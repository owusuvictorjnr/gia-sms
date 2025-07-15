import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Announcement,  } from "./announcement.entity";
import { CreateAnnouncementDto } from "./dto/create-announcement.dto";
import { User } from "../user/user.entity";
import { AnnouncementStatus } from "shared-types/src/announcement-status.enum";


// AnnouncementService handles the business logic for announcements
@Injectable()
export class AnnouncementService {
  constructor(
    @InjectRepository(Announcement)
    private announcementsRepository: Repository<Announcement>
  ) {}

  // For a teacher to create a new announcement
  async create(
    createAnnouncementDto: CreateAnnouncementDto,
    author: User
  ): Promise<Announcement> {
    const newAnnouncement = this.announcementsRepository.create({
      ...createAnnouncementDto,
      authorId: author.id,
      status: AnnouncementStatus.PENDING,
    });
    return this.announcementsRepository.save(newAnnouncement);
  }

  // For an admin to find all pending announcements
  async findPending(): Promise<Announcement[]> {
    return this.announcementsRepository.find({
      where: { status: AnnouncementStatus.PENDING },
      relations: ["author"], // Include the author's details
      order: { createdAt: "DESC" },
    });
  }

  // For an admin to approve or reject an announcement
  async updateStatus(
    id: string,
    status: AnnouncementStatus,
    admin: User
  ): Promise<Announcement> {
    const announcement = await this.announcementsRepository.findOneBy({ id });
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID "${id}" not found`);
    }

    announcement.status = status;
    if (status === AnnouncementStatus.APPROVED) {
      announcement.approvedById = admin.id;
    }

    return this.announcementsRepository.save(announcement);
  }
}
