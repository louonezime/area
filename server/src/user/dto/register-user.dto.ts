import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

const MIN_LENGTH_NAME = 1;
const MAX_LENGTH_NAME = 100;
const MIN_LENGTH_PASSWORD = 4;
const MAX_LENGTH_PASSWORD = 100;

export class RegisterDto {
  @ApiProperty({
    minLength: MIN_LENGTH_NAME,
  })
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({
    minLength: MIN_LENGTH_PASSWORD,
  })
  password: string;
}

export const registerSchema = z
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

export type registerDto = z.infer<typeof registerSchema>;
