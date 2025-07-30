import { Injectable } from '@nestjs/common';
import { PrismaService } from '../utils/prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email },
    });
  }

  // async updateMetadata(id: string, metadata: Prisma.InputJsonValue): Promise<User> {
  //   return this.prisma.user.update({
  //     where: { id },
  //     data: { metadata },
  //   });
  // }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async getUsersName(userIds: string[]): Promise<string[]> {
    const users: { full_name: string }[] = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { full_name: true },
    });

    return users.map((user) => user.full_name);
  }

  async findChatBetweenMembers(members: string[]): Promise<{ id: string } | null> {
    const [sender_id, receiver_id] = members;
    return this.prisma.chat.findFirst({
      where: {
        OR: [
          { created_by: sender_id, receiver_id: receiver_id },
          { created_by: receiver_id, receiver_id: sender_id },
        ],
      },
      select: { id: true },
    });
  }
}
