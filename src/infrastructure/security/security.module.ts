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
        secret: config.get<string>('environment.jwt.secret'),
        signOptions: { expiresIn: config.get<string>('environment.jwt.expiresIn') as any },
      }),
    }),
  ],
  providers: [BcryptPasswordHasherService, JwtTokenService],
  exports: [JwtModule, BcryptPasswordHasherService, JwtTokenService],
})
export class SecurityModule {}
