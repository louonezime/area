import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

const MIN_LENGTH_API_KEY = 1;
const MAX_LENGTH_API_KEY = 300;

export class ApiKeyDto {
  @ApiProperty({
    minLength: MIN_LENGTH_API_KEY,
    maxLength: MAX_LENGTH_API_KEY,
  })
  apiKey: string;
}

export const apiKeySchema = z
  .object({
    apiKey: z
      .string()
      .min(
        MIN_LENGTH_API_KEY,
        `ApiKey must be at least ${MIN_LENGTH_API_KEY} characters long`,
      )
      .max(
        MAX_LENGTH_API_KEY,
        `ApiKey can only be a maximum of ${MAX_LENGTH_API_KEY} characters long`,
      ),
  })
  .required();

export type apiKeyDto = z.infer<typeof apiKeySchema>;
