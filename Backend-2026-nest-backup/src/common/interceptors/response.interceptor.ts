import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RAW_RESPONSE_KEY } from '../../features/auth/infrastructure/decorators/raw-response.decorator';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const raw =
      Reflect.getMetadata(RAW_RESPONSE_KEY, context.getHandler()) ??
      Reflect.getMetadata(RAW_RESPONSE_KEY, context.getClass());
    if (raw) return next.handle();

    const statusCode = context.switchToHttp().getResponse().statusCode;
    return next.handle().pipe(
      map((data) => ({
        statusCode,
        message: 'Operación realizada con éxito',
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
