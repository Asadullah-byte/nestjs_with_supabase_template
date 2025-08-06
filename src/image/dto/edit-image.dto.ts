import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class EditImageDto {
  @ApiProperty({
    example: 'resp_ab23lnk',
    description: 'Response Id of the repsonse ',
  })
  @IsString()
  image_id!: string;

  @ApiProperty({
    example: 'Generate an image of gray tabby cat hugging an otter with an orange scarf',
    description: 'A descriptive message to generate',
  })
  @IsString()
  input!: string;
}
