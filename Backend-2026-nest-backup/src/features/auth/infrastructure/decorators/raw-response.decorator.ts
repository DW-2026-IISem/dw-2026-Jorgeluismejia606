import { SetMetadata } from '@nestjs/common';

export const RAW_RESPONSE_KEY = 'rawResponse';
/** Devuelve el cuerpo tal cual, sin el envoltorio { statusCode, data } del ResponseInterceptor. */
export const RawResponse = () => SetMetadata(RAW_RESPONSE_KEY, true);
