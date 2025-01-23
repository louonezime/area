import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

const MIN_LENGTH_PASSWORD = 4;
const MAX_LENGTH_PASSWORD = 100;

export class LoginUserDto {
  @ApiProperty()
  email: string;

  @ApiProperty({
    minLength: MIN_LENGTH_PASSWORD,
  })
  password: string;
}

export const loginSchema = z
  .object({
    email: z.string().email('Invalid email address format'),
    password: z
      .string()
      .min(
        MIN_LENGTH_PASSWORD,
        `Password must be at least ${MIN_LENGTH_PASSWORD} characters long`,
      )
      .max(
        MAX_LENGTH_PASSWORD,
        `Password can only be a maximum of ${MIN_LENGTH_PASSWORD} characters long`,
      ),
  })
  .required();

export type loginDto = z.infer<typeof loginSchema>;
