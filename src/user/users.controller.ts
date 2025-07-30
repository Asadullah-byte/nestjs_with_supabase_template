import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  NotFoundException,
  Req /*, Put*/,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
// import { UpdateMetadataDto } from './dto/update-metadata.dto';

import {
  ApiGetUser,
  ApiUpdateUser,
  ApiDeleteUser,
  // ApiUpdateMetadata,
} from './docs/api-docs.decorator';
import { Auth } from '@decorators/auth.decorator';

import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

@Auth()
@ApiTags('User Self')
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private getUserId(req: Request): string {
    const user = req.user as { id: string };
    if (!user || typeof user.id !== 'string') {
      throw new NotFoundException('User ID not found in request');
    }
    return user.id;
  }

  @Get('me')
  @ApiGetUser()
  async findOne(@Req() req: Request): Promise<User> {
    const userId = this.getUserId(req);
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  @Patch()
  @ApiUpdateUser()
  async update(@Req() req: Request, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    const userId = this.getUserId(req);
    try {
      return await this.usersService.update(userId, updateUserDto);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      throw error;
    }
  }

  // @Put('metadata')
  // @ApiUpdateMetadata()
  // async updateMetadata(
  //   @Req() req: Request,
  //   @Body() updateMetadataDto: UpdateMetadataDto,
  // ): Promise<User> {
  //   const userId = this.getUserId(req);
  //   try {
  //     return await this.usersService.updateMetadata(userId, updateMetadataDto.metadata);
  //   } catch (error) {
  //     if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
  //       throw new NotFoundException(`User with ID ${userId} not found`);
  //     }
  //     throw error;
  //   }
  // }

  @Delete()
  @ApiDeleteUser()
  async remove(@Req() req: Request): Promise<User> {
    const userId = this.getUserId(req);
    try {
      return await this.usersService.remove(userId);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      throw error;
    }
  }
}
