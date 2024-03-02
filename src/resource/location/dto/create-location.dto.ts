import { IsNotEmpty } from 'class-validator';

export class CreateLocationDto {
  @IsNotEmpty({ message: 'location_name cannot be empty' })
  name: string;

  @IsNotEmpty({ message: 'location_code cannot be empty' })
  code: string;
}
