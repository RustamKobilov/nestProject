import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    if (status === 400) {
      const errorResponse = {
        errorsMessages: [],
      };
      const resp: any = exception.getResponse();
      try {
        resp.message.forEach((x) =>
          errorResponse.errorsMessages.push(x as never),
        );
        //TODO never? conso0le.log(user.repository)
        return response.status(status).json(errorResponse);
      } catch (e) {
        const fieldRandom = exception.message.split(' ')[0];
        return response.status(status).json({
          errorsMessages: [
            {
              message: exception.message,
              field: fieldRandom,
            },
          ],
        });
      }
    }
    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
