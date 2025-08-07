import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@utils/prisma/prisma.service';
import { SupabaseService } from '@utils/supabase/supabase.service';
import OpenAI from 'openai';
import { GenerateImageDto } from './dto/generate-image.dto';
import { EditImageDto } from './dto/edit-image.dto';
import { decodeJwt } from 'jose';

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

    const { data: signedUrlData } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 60);

    if (!signedUrlData) throw new Error('Signed Url not generated or exits ');

    await this.prisma.images.create({
      data: {
        user_id: userId,
        image_id: response.id,
        image_url: signedUrlData.signedUrl,
        file_path: filePath,
      },
    });
    return {
      message: 'Image Generated successfully',
      url: signedUrlData.signedUrl,
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

    const { data: signedUrlData } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 60);

    if (!signedUrlData) throw new Error('Signed Url not generated or exits ');
    await this.prisma.images.update({
      where: { image_id: EditImageDto.image_id },
      data: {
        image_id: response.id,
        image_url: signedUrlData.signedUrl,
        file_path: filePath,
      },
    });
    return {
      message: 'Profile picture uploaded successfully',
      url: signedUrlData.signedUrl,
    };
  }
  async getImages(userId: string, token: string, image_id: string) {
    const totalStart = performance.now();
    const dbStart = performance.now();
    const supabase = this.supabaseService.getClientWithAuth(token);
    const bucket = 'generated-images';
    const fileName = image_id;
    const filePath = `${userId}/${fileName}`;
    const image = await this.prisma.images.findFirst({
      where: { image_id: image_id },
    });
    const dbEnd = performance.now();
    console.log(`DB Query Time: ${dbEnd - dbStart} ms`);

    const user = image?.file_path?.split('/')[1];

    if (!(user === userId)) {
      throw new UnauthorizedException('You are not allowed to access this file');
    }

    if (!image) throw new Error('Image no found/not exists');
    const url = image.image_url;
    if (!url) {
      throw new Error('Image URL is missing');
    }
    // const { data: signedUrlData } = await supabase.storage
    //   .from(bucket)
    //   .createSignedUrl(filePath, 60);
    // if (!signedUrlData) throw new Error('Signed Url not generated or exits ');
    // await this.prisma.images.update({
    //   where: { image_id: image_id },
    //   data: {
    //     image_url: signedUrlData.signedUrl,
    //   },
    // });

    try {
      const jwtStart = performance.now();
      const urlObj = new URL(url);
      const urlToken = urlObj.searchParams.get('token');
      if (!urlToken) throw new Error('No Token Exists');
      const urlTokenPayload = decodeJwt(urlToken);
      const expiresAt = urlTokenPayload.exp;
      if (!expiresAt) throw new Error('No expires at ');
      const jwtEnd = performance.now();
      console.log(`JWT Decode Time: ${jwtEnd - jwtStart} ms`);

      const expiresAtTime = new Date(expiresAt * 1000).getTime();
      const now = Date.now();
      const bufferTime = 60 * 1000;

      if (expiresAtTime - now <= bufferTime) {
        const supabaseStart = performance.now();
        const { data: signedUrlData, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(filePath, 60 * 3);
        const supabaseEnd = performance.now();
        console.log(`Supabase URL Generation Time: ${supabaseEnd - supabaseStart} ms`);

        if (error || !signedUrlData) throw new Error('Failed to generate a new signed URL');
        const dbStart = performance.now();
        await this.prisma.images.update({
          where: { image_id: image_id },
          data: {
            image_url: signedUrlData.signedUrl,
          },
        });
        const dbEnd = performance.now();
        console.log(`DB Query Time: ${dbEnd - dbStart} ms`);
        const totalEnd = performance.now();
        console.log(`Total Method Time (with new URL): ${totalEnd - totalStart} ms`);

        return {
          message: 'New Url Generated',
          url: signedUrlData.signedUrl,
        };
      }
    } catch (error) {
      console.log(error);
      throw new Error('Invalid URL in image.image_url');
    }
    const totalEnd = performance.now();
    console.log(`Total Method Time (with new URL): ${totalEnd - totalStart} ms`);
    return {
      message: 'Existing token is still valid.',
      url,
    };

    //!     without check for token ####
    //           Time taken: 1800.636999999988 milliseconds (same created new)
    // 					 Time taken: 2213 milliseconds	(same created new)
    // 					 Time taken: 1214.636999999988 milliseconds	(same created new)

    //!    with check for token ####
    //           Time taken: 2413 milliseconds (if expired --> new Url)
    // 					 Time taken: 372 milliseconds (not expired)
    // 					 Time taken: 1560.636999999988 milliseconds (if expired --> new Url)
  }
}
