import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Announcement } from "./announcement.entity";
import { CreateAnnouncementDto } from "./dto/create-announcement.dto";
import { User } from "../user/user.entity";
import { AnnouncementStatus } from "shared-types/src/announcement-status.enum"; // Import from shared package

// AnnouncementService handles the business logic for announcements@Injectable()
export class AnnouncementService {
  constructor(
    @InjectRepository(Announcement)
    private announcementsRepository: Repository<Announcement>
  ) {}

  // For a teacher to create a new announcement
  async create(
    createAnnouncementDto: CreateAnnouncementDto,
    author: any // The user object from the JWT payload
  ): Promise<Announcement> {
    const newAnnouncement = this.announcementsRepository.create({
      ...createAnnouncementDto,
      authorId: author.userId,
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
    admin: any // The user object from the JWT payload
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

  // New method to find all approved announcements for parents
  async findAllApproved(): Promise<Announcement[]> {
    return this.announcementsRepository.find({
      where: { status: AnnouncementStatus.APPROVED },
      relations: ["author"], // Include author details
      order: { createdAt: "DESC" }, // Show newest first
    });
  }
}
