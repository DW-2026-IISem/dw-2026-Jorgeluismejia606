import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserModel, UserRole } from '../../infrastructure/persistence/models/user.model';
import { LoginDto } from '../../presentation/dto/login.dto';
import { RegisterDto } from '../../presentation/dto/register.dto';
import { RefreshTokenDto } from '../../presentation/dto/refresh-token.dto';
import { BcryptPasswordHasherService } from '../../../../infrastructure/security/hashing/bcrypt-password-hasher.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly passwordHasher: BcryptPasswordHasherService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private getAccessSecret(): string {
    return this.configService.getOrThrow<string>('JWT_SECRET');
  }

  private getRefreshSecret(): string {
    return this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
  }

  async register(dto: RegisterDto) {
    const existing = await UserModel.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('El correo ya se encuentra registrado');
    }

    const user = await UserModel.create({
      nombre: dto.nombre,
      email: dto.email,
      password_hash: await this.passwordHasher.hash(dto.password),
      rol: dto.rol || UserRole.LECTOR,
    });

    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      message: 'Usuario registrado exitosamente',
    };
  }

  async login(dto: LoginDto) {
    const user = await UserModel.findOne({
      where: {
        email: dto.email,
        is_active: true,
      },
    });

    if (!user || !(await this.passwordHasher.compare(dto.password, user.password_hash))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.rol);
    await user.update({ refresh_token_hash: this.hashToken(tokens.refreshToken) });

    return {
      ...tokens,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    };
  }

  async refreshTokens(dto: RefreshTokenDto) {
    let payload: any;

    try {
      payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: this.getRefreshSecret(),
      });
    } catch {
      throw new ForbiddenException('Refresh token expirado o inválido');
    }

    const user = await UserModel.findByPk(payload.sub);
    if (!user || !user.refresh_token_hash) {
      throw new ForbiddenException('Acceso denegado');
    }

    const refreshMatches = user.refresh_token_hash === this.hashToken(dto.refreshToken);
    if (!refreshMatches) {
      throw new ForbiddenException('Refresh token no reconocido');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.rol);
    await user.update({ refresh_token_hash: this.hashToken(tokens.refreshToken) });

    return tokens;
  }

  private async generateTokens(userId: number, email: string, rol: string) {
    const jwtPayload = { sub: userId, email, rol };
    const accessExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '15m';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.getAccessSecret(),
        expiresIn: accessExpiresIn as any,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.getRefreshSecret(),
        expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d') as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: accessExpiresIn,
    };
  }
}
