import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GenerateImageDto {
  @ApiProperty({
    example: 'Generate an image of gray tabby cat hugging an otter with an orange scarf',
    description: 'A descriptive message to generate',
  })
  @IsString()
  input!: string;
}
