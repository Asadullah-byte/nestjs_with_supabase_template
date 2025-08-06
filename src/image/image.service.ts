import { Injectable } from '@nestjs/common';
import { PrismaService } from '@utils/prisma/prisma.service';
import { SupabaseService } from '@utils/supabase/supabase.service';
import OpenAI from 'openai';
import { GenerateImageDto } from './dto/generate-image.dto';
import { EditImageDto } from './dto/edit-image.dto';

@Injectable()
export class ImageService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
  ) {}
  async generateImage(userId: string, token: string, GenerateImageDto: GenerateImageDto) {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.responses.create({
      model: 'gpt-4.1-mini',
      input: GenerateImageDto.input,
      tools: [{ type: 'image_generation' }],
    });
    console.log(response);

    const imageData = response.output
      .filter((output) => output.type === 'image_generation_call')
      .map((output) => output.result);
    const fileName = response.id;
    const imageBase64 = imageData[0];

    if (!imageBase64) throw new Error('image not generated');
    const supabase = this.supabaseService.getClientWithAuth(token);
    const bucket = 'generated-images';
    const filePath = `${userId}/${fileName}`;
    console.log(filePath);

    const imageBuffer = Buffer.from(imageBase64, 'base64');
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, imageBuffer, { contentType: 'image/png' });
    if (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }

    const { data: PublicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

    if (!PublicUrlData) throw new Error('Signed Url not generated or exits ');

    await this.prisma.images.create({
      data: {
        user_id: userId,
        image_id: response.id,
        image_url: PublicUrlData.publicUrl,
      },
    });
    return {
      message: 'Image Generated successfully',
      url: PublicUrlData.publicUrl,
    };
  }

  async editImage(userId: string, token: string, EditImageDto: EditImageDto) {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const image = await this.prisma.images.findFirst({
      where: { image_id: EditImageDto.image_id },
    });
    if (!image) throw new Error('Image no found/not exists');

    const response = await openai.responses.create({
      model: 'gpt-4.1-mini',
      previous_response_id: image.image_id,
      input: EditImageDto.input,
      tools: [{ type: 'image_generation' }],
    });
    console.log(response);

    const imageData = response.output
      .filter((output) => output.type === 'image_generation_call')
      .map((output) => output.result);
    const fileName = response.id;
    const imageBase64 = imageData[0];

    if (!imageBase64) throw new Error('image not generated');
    const supabase = this.supabaseService.getClientWithAuth(token);
    const bucket = 'generated-images';
    const filePath = `${userId}/${fileName}`;
    console.log(filePath);

    const imageBuffer = Buffer.from(imageBase64, 'base64');

    const { error: deleteError } = await supabase.storage
      .from(bucket)
      .remove([`${userId}/${EditImageDto.image_id}`]);

    if (deleteError) {
      console.error('Error deleting old file:', deleteError);
    } else {
      console.log('Old file deleted successfully');
    }

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, imageBuffer, { contentType: 'image/png' });
    if (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }

    const { data: PublicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

    if (!PublicUrlData) throw new Error('Signed Url not generated or exits ');
    await this.prisma.images.update({
      where: { image_id: EditImageDto.image_id },
      data: {
        user_id: userId,
        image_id: response.id,
        image_url: PublicUrlData.publicUrl,
      },
    });
    return {
      message: 'Profile picture uploaded successfully',
      url: PublicUrlData.publicUrl,
    };
  }
}
