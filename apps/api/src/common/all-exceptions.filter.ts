import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

type HttpErrorPayload = {
  message?: unknown;
  error?: unknown;
};

function toDefaultErrorText(statusCode: number) {
  const statusName = HttpStatus[statusCode];

  if (!statusName || typeof statusName !== 'string') {
    return 'Error';
  }

  return statusName
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message: unknown = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        message = payload;
        error = toDefaultErrorText(statusCode);
      } else {
        const httpPayload = payload as HttpErrorPayload;
        message = httpPayload.message ?? message;
        error =
          typeof httpPayload.error === 'string'
            ? httpPayload.error
            : toDefaultErrorText(statusCode);
      }
    }

    response.status(statusCode).json({
      statusCode,
      error,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
