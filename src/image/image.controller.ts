import { Body, Controller, Get, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { ImageService } from './image.service';
import { SupabaseAuthGuard } from '@utils/common/guards/supabase-auth.guard';
import { Role } from '@utils/common/enum/role.enum';
import { AuthTokenResponse } from '@supabase/supabase-js';
import { Request } from 'express';
import { GenerateImageDto } from './dto/generate-image.dto';
import { EditImageDto } from './dto/edit-image.dto';
import { ApiEditImage, ApiGenerateImage } from './docs/api-docs.decorator';
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
@UseGuards(SupabaseAuthGuard)
@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get('generate')
  @ApiGenerateImage()
  async generateImage(
    @Req() req: AuthenticatedRequest,
    @Body(ValidationPipe) GenerateImageDto: GenerateImageDto,
  ) {
    const user_id = req.user.id;
    const accessToken = req.cookies['access_token'] as string;
    return this.imageService.generateImage(user_id, accessToken, GenerateImageDto);
  }
  @Get('edit-image')
  @ApiEditImage()
  async editImage(
    @Req() req: AuthenticatedRequest,
    @Body(ValidationPipe) EditImageDto: EditImageDto,
  ) {
    const user_id = req.user.id;
    const accessToken = req.cookies['access_token'] as string;
    return this.imageService.editImage(user_id, accessToken, EditImageDto);
  }
}
