import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { RolesGuards } from '@utils/common/guards/role.guard';
import { SupabaseAuthGuard } from '@utils/common/guards/supabase-auth.guard';
import { AdminService } from './admin.service';
import { Roles } from '@utils/common/decorators/role.decorator';
import { Role } from '@utils/common/enum/role.enum';
import { DeactivateUserDto } from './dto/deactivate-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import {
  ApiActivateUser,
  ApiDeactivateUser,
  ApiDeleteUser,
  ApiGetUsers,
} from './docs/api-docs.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Admin')
@UseGuards(SupabaseAuthGuard, RolesGuards)
@Roles(Role.Admin)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Get('users')
  @HttpCode(HttpStatus.OK)
  @ApiGetUsers()
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Patch('users/:id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiDeactivateUser()
  async deactivateUser(
    @Param(new ValidationPipe({ whitelist: true })) deactivateUserDto: DeactivateUserDto,
  ) {
    return this.adminService.deactivateUser(deactivateUserDto);
  }
  @Patch('users/:id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiActivateUser()
  async activateUser(
    @Param(new ValidationPipe({ whitelist: true })) activateUserDto: DeactivateUserDto,
  ) {
    return this.adminService.activateUser(activateUserDto);
  }

  @Delete('users/:id/delete')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteUser()
  async deleteUser(@Param(new ValidationPipe({ whitelist: true })) deleteUserDto: DeleteUserDto) {
    return this.adminService.deleteUser(deleteUserDto);
  }
}
