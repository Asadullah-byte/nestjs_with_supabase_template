import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  NotFoundException,
  Req /*, Put*/,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
// import { UpdateMetadataDto } from './dto/update-metadata.dto';

import {
  ApiGetUser,
  ApiUpdateUser,
  ApiDeleteUser,
  ApiGetProfilePhoto,
  ApiUploadProfilePhoto,
  // ApiUpdateMetadata,
} from './docs/api-docs.decorator';
import { Auth } from '@decorators/auth.decorator';

import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@utils/common/enum/role.enum';
import { AuthTokenResponse } from '@supabase/supabase-js';

interface CustomUser {
  id: string;
  email: string;
  role: Role;
  full_name: string;
  is_deactivated: boolean;
  profile_pic: string | null;
}
interface AuthenticatedRequest extends Request {
  user: CustomUser;
  complete_user?: AuthTokenResponse['data'];
}

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

  @Get('profile-pic')
  @ApiGetProfilePhoto()
  getProfilePic(@Req() req: AuthenticatedRequest) {
    const profileAvatar = req.user.profile_pic;
    return { message: 'Cool Pic', url: profileAvatar };
  }

  @Post('profile-pic/upload')
  @ApiUploadProfilePhoto()
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePic(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const accessToken = req.cookies['access_token'] as string;
    return this.usersService.uploadProfilePic(file, userId, accessToken);
  }
}
