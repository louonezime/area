import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

const MIN_LENGTH_AREA_NAME = 1;
const MAX_LENGTH_AREA_NAME = 300;

const MIN_LENGTH_SERVICE_NAME = 1;
const MAX_LENGTH_SERVICE_NAME = 300;

export class AreaDetailsDto {
  @ApiProperty({
    minLength: MIN_LENGTH_AREA_NAME,
    maxLength: MAX_LENGTH_AREA_NAME,
  })
  name: string;

  @ApiProperty({
    minLength: MIN_LENGTH_SERVICE_NAME,
    maxLength: MAX_LENGTH_SERVICE_NAME,
  })
  service: string;

  @ApiProperty({ required: false })
  data?: Record<string, any>;
}

export class AreaDto {
  @ApiProperty()
  action: AreaDetailsDto;

  @ApiProperty()
  reaction: AreaDetailsDto;
}

export const areaDetailsSchema = z.object({
  name: z
    .string()
    .min(
      MIN_LENGTH_AREA_NAME,
      `Name must be at least ${MIN_LENGTH_AREA_NAME} characters long`,
    )
    .max(
      MAX_LENGTH_AREA_NAME,
      `Name can only be a maximum of ${MAX_LENGTH_AREA_NAME} characters long`,
    ),
  service: z
    .string()
    .min(
      MIN_LENGTH_SERVICE_NAME,
      `Service must be at least ${MIN_LENGTH_SERVICE_NAME} characters long`,
    )
    .max(
      MAX_LENGTH_SERVICE_NAME,
      `Service can only be a maximum of ${MAX_LENGTH_SERVICE_NAME} characters long`,
    ),
  data: z.record(z.unknown()).optional(),
});

export type areaDetailsDto = z.infer<typeof areaDetailsSchema>;

export const areaSchema = z
  .object({
    action: areaDetailsSchema,
    reaction: areaDetailsSchema,
  })
  .required();

export type areaDto = z.infer<typeof areaSchema>;
