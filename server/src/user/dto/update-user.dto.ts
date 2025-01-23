import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

const MIN_LENGTH_NAME = 1;
const MAX_LENGTH_NAME = 100;

export class UpdateUserDto {
  @ApiProperty()
  name?: string;

  @ApiProperty()
  email?: string;
}

export const updateSchema = z
  .object({
    name: z
      .string()
      .min(
        MIN_LENGTH_NAME,
        `Name must be at least ${MIN_LENGTH_NAME} characters long`,
      )
      .max(
        MAX_LENGTH_NAME,
        `Name can only be a maximum of ${MAX_LENGTH_NAME} characters long`,
      ),
    email: z.string().email('Invalid email address format').optional(),
  })
  .optional();

export type updateDto = z.infer<typeof updateSchema>;
