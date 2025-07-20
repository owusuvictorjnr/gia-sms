import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalendarEvent } from './calendar.entity';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { User } from '../user/user.entity';


// CalendarService handles the business logic for calendar events
// It allows admins to create new events and users to view existing ones
@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(CalendarEvent)
    private calendarRepository: Repository<CalendarEvent>,
  ) {}

  async create(
    createDto: CreateCalendarEventDto,
    user: any, // User from JWT payload
  ): Promise<CalendarEvent> {
    const newEvent = this.calendarRepository.create({
      ...createDto,
      createdById: user.userId, // Use userId from JWT payload
    });
    return this.calendarRepository.save(newEvent);
  }

  async findAll(): Promise<CalendarEvent[]> {
    return this.calendarRepository.find({
      order: { startDate: 'ASC' },
      relations: ['createdBy'],
    });
  }
}
