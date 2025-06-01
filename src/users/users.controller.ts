import { Controller, Get, Body, Patch, Delete, NotFoundException, Req } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { ApiGetUser, ApiUpdateUser, ApiDeleteUser } from './decorators/api-docs.decorator';
import { Auth } from '@decorators/auth.decorator';

@Auth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiGetUser()
  async findOne(@Req() req: Request): Promise<User> {
    const userId = req.user.id;
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  @Patch()
  @ApiUpdateUser()
  async update(@Req() req: Request, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    try {
      return await this.usersService.update(req.user.id, updateUserDto);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${req.user.id} not found`);
      }
      throw error;
    }
  }

  @Delete()
  @ApiDeleteUser()
  async remove(@Req() req: Request): Promise<User> {
    try {
      return await this.usersService.remove(req.user.id);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${req.user.id} not found`);
      }
      throw error;
    }
  }
}
