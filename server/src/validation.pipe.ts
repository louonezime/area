import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      if (metadata.type != 'body') return value;
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        Logger.debug(`ZOD Validation failed:`);
        Logger.debug(validationErrors);
        throw new BadRequestException({
          message: 'Data validation failed',
          errors: validationErrors,
        });
      }
      throw new BadRequestException(`Data validation failed, ${error}`);
    }
  }
}
