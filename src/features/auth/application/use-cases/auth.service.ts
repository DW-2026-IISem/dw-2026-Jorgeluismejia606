import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserModel, UserRole } from '../../infrastructure/persistence/models/user.model';
import { LoginDto } from '../../presentation/dto/login.dto';
import { RegisterDto } from '../../presentation/dto/register.dto';
import { RefreshTokenDto } from '../../presentation/dto/refresh-token.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  async register(dto: RegisterDto) {
    const existing = await UserModel.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('El correo ya se encuentra registrado');
    }

    const user = await UserModel.create({
      email: dto.email,
      password_hash: this.hashData(dto.password),
      rol: dto.rol || UserRole.LECTOR,
    });

    return {
      id: user.id,
      email: user.email,
      rol: user.rol,
      message: 'Usuario registrado exitosamente',
    };
  }

  async login(dto: LoginDto) {
    const user = await UserModel.findOne({
      where: {
        email: dto.email,
        password_hash: this.hashData(dto.password),
        is_active: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.rol);
    await user.update({ refresh_token_hash: this.hashData(tokens.refreshToken) });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        rol: user.rol,
      },
    };
  }

  async refreshTokens(dto: RefreshTokenDto) {
    let payload: any;
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secreto-super-seguro-2026';

    try {
      payload = await this.jwtService.verifyAsync(dto.refreshToken, { secret });
    } catch {
      throw new ForbiddenException('Refresh token expirado o inválido');
    }

    const user = await UserModel.findByPk(payload.sub);
    if (!user || !user.refresh_token_hash) {
      throw new ForbiddenException('Acceso denegado');
    }

    const refreshMatches = user.refresh_token_hash === this.hashData(dto.refreshToken);
    if (!refreshMatches) {
      throw new ForbiddenException('Refresh token no reconocido');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.rol);
    await user.update({ refresh_token_hash: this.hashData(tokens.refreshToken) });

    return tokens;
  }

  private async generateTokens(userId: number, email: string, rol: string) {
    const jwtPayload = { sub: userId, email, rol };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_SECRET') || 'secreto-super-seguro-lectura-abierta-2026',
        expiresIn: (this.configService.get<string>('JWT_EXPIRES_IN') || '15m') as any,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secreto-super-seguro-2026',
        expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d') as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: '15m',
    };
  }
}
