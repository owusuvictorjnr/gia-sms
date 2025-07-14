import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../user/user.entity";



// The ParentService is responsible for handling parent-related functionality, such as retrieving a parent's children.
@Injectable()
export class ParentService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async findMyChildren(parent: User): Promise<User[]> {
    const parentWithChildren = await this.usersRepository.findOne({
      where: { id: parent.id },
      relations: ["children"], // This is crucial - it tells TypeORM to load the related children
    });

    if (!parentWithChildren) {
      throw new NotFoundException("Parent not found");
    }

    // Return the children, making sure to exclude their sensitive data
    return parentWithChildren.children.map(
      ({ password, ...rest }) => rest as User
    );
  }
}
