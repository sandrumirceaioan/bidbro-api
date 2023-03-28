import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import * as mongoose from 'mongoose';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor() { }

  catch(err: any, host: ArgumentsHost): void {
    let response = host.switchToHttp().getResponse();
    let customError: any = { status: null, message: [] };
    switch (err.name) {
      case mongoose.Error.ValidationError.name:
        customError.status = 500;
        for (let field in err.errors) customError.message = err.errors[field].message;
        break;
      case 'MongoServerError':
        customError.status = 500;
        if (err.code === 11000) {
          for (let key in err.keyValue) {
            customError.message = `Duplicated ${key}: ${err.keyValue.name}`;
          }
        } else {
          customError.message = err.message;
        }
        break;
      case 'CastError':
        customError.status = 500;
        customError.message = err.message;
        break;
      case 'TypeError':
        customError.status = 500;
        customError.message = err.message;
        break;
      case HttpException.name:
        customError.status = err.getStatus();
        customError.message = err.message;
        break;
      case 'BadRequestException':
        customError.status = err.response.statusCode;
        customError.message = err.response.message;
        break;
      case 'UnauthorizedException':
        customError.status = err.response.statusCode;
        customError.message = err.response.message;
        break;
      default:
        customError.status = 500;
        customError.message = err ? err.message : 'Internal server error';
        break;
    }

    return response.status(customError.status).json(customError);
  }
}