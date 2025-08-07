import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@utils/prisma/prisma.service';
import { DeactivateUserDto } from './dto/deactivate-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  constructor(private readonly prisma: PrismaService) {}

  async getUsers() {
    try {
      const usersList = await this.prisma.user.findMany({
        where: { roles: { role: 'user' } },
      });
      return {
        messsage: 'Search Successful',
        users: usersList,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unkown error';
      this.logger.error(`Error during Db search ${errorMessage}`);
      throw new InternalServerErrorException('Error with server');
    }
  }

  async deactivateUser(deactivateUserDto: DeactivateUserDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: deactivateUserDto.id },
      });
      if (!user) {
        throw new NotFoundException("User doesn't exists");
      }
      const updatedUser = await this.prisma.user.update({
        where: { id: deactivateUserDto.id },
        data: {
          is_deactivated: true,
        },
      });

      return { message: 'User has been deactivated', updatedUser: updatedUser };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unkown error';
      this.logger.error(`Error during Db search ${errorMessage}`);
      this.logger.error('Error deactivating user');
      throw new InternalServerErrorException('Some Error occured updating user');
    }
  }
  async activateUser(deactivateUserDto: DeactivateUserDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: deactivateUserDto.id },
      });
      if (!user) {
        throw new NotFoundException("User doesn't exists");
      }
      const updatedUser = await this.prisma.user.update({
        where: { id: deactivateUserDto.id },
        data: {
          is_deactivated: false,
        },
      });

      return { message: 'User has been deactivated', updatedUser: updatedUser };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unkown error';
      this.logger.error(`Error during Db search ${errorMessage}`);
      throw new InternalServerErrorException('Some Error occured updating user');
    }
  }

  async deleteUser(deleteUserDto: DeleteUserDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: deleteUserDto.id },
      });
      if (!user) {
        throw new NotFoundException("User doesn't exists");
      }
      const deleteUser = await this.prisma.user.delete({
        where: { id: deleteUserDto.id },
      });
      return { message: 'User has been deactivated', deleteUser: deleteUser };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unkown Error';
      this.logger.error(`Error during Db search ${errorMessage}`);
      throw new InternalServerErrorException('Some Error occured updating user');
    }
  }
}
