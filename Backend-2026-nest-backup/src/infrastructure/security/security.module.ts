import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BcryptPasswordHasherService } from './hashing/bcrypt-password-hasher.service';
import { JwtTokenService } from './tokens/jwt-token.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: (config.get<string>('JWT_EXPIRES_IN') || '15m') as any },
      }),
    }),
  ],
  providers: [BcryptPasswordHasherService, JwtTokenService],
  exports: [JwtModule, BcryptPasswordHasherService, JwtTokenService],
})
export class SecurityModule {}
