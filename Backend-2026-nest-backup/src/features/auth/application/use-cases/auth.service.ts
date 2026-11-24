import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserModel, UserRole } from '../../infrastructure/persistence/models/user.model';
import { LoginDto } from '../../presentation/dto/login.dto';
import { RegisterDto } from '../../presentation/dto/register.dto';
import { RefreshTokenDto } from '../../presentation/dto/refresh-token.dto';
import { BcryptPasswordHasherService } from '../../../../infrastructure/security/hashing/bcrypt-password-hasher.service';
import { SesionLoginDto } from '../../presentation/dto/sesion-login.dto';
import { Op, QueryTypes } from 'sequelize';
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
      rol: UserRole.LECTOR,
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

  async sesionLogin(dto: SesionLoginDto) {
    const user = await UserModel.findOne({
      where: {
        [Op.or]: [{ email: dto.identifier }, { username: dto.identifier }],
        is_active: true,
      },
    });

    if (!user || !(await this.passwordHasher.compare(dto.password, user.password_hash))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.rol);
    await user.update({ refresh_token_hash: this.hashToken(tokens.refreshToken) });

    return {
      access_token: tokens.accessToken,
      token_type: tokens.tokenType,
      expires_in: this.secondsToExpire(tokens.accessToken),
      refresh_token: tokens.refreshToken,
      refresh_expires_in: this.secondsToExpire(tokens.refreshToken),
    };
  }

  async perfil(userId: number) {
    const user = await UserModel.findByPk(userId);
    if (!user || !user.is_active) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }
    return {
      id: user.id,
      username: user.username,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    };
  }

  async permisosEfectivos(rol: string) {
    const permissions = await UserModel.sequelize!.query(
      `SELECT rec.id AS resource_id, rec.method, rec.path, rec.description,
              r.id AS role_id, r.name AS role_name
         FROM roles r
         JOIN roles_recursos rr ON rr.role_id = r.id
         JOIN recursos rec ON rec.id = rr.resource_id
        WHERE r.name = :rol
        ORDER BY rec.path, rec.method`,
      { replacements: { rol }, type: QueryTypes.SELECT },
    );
    return { permissions };
  }

  private secondsToExpire(token: string): number {
    const { exp, iat } = this.jwtService.decode(token) as { exp: number; iat: number };
    return exp - iat;
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

  /**
   * POST /api/sesion/refresh — la misma rotación de refreshTokens(), pero con el
   * formato snake_case de /sesion/login. Un refresh inválido o ya rotado
   * responde 401 (no 403) para que el cliente sepa que debe volver al login.
   */
  async sesionRefresh(refreshToken: string) {
    try {
      const tokens = await this.refreshTokens({ refreshToken });
      return {
        access_token: tokens.accessToken,
        token_type: tokens.tokenType,
        expires_in: this.secondsToExpire(tokens.accessToken),
        refresh_token: tokens.refreshToken,
        refresh_expires_in: this.secondsToExpire(tokens.refreshToken),
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }
  }

  /**
   * POST /api/sesion/logout — revoca el refresh presentado borrando su hash.
   * Idempotente: con un token inválido, expirado o ya revocado responde igual.
   */
  async sesionLogout(refreshToken?: string) {
    if (refreshToken) {
      try {
        const payload = await this.jwtService.verifyAsync(refreshToken, {
          secret: this.getRefreshSecret(),
        });
        const user = await UserModel.findByPk(payload.sub);
        if (user && user.refresh_token_hash === this.hashToken(refreshToken)) {
          await user.update({ refresh_token_hash: null });
        }
      } catch {
        /* token inválido o expirado: no hay nada que revocar */
      }
    }
    return { message: 'Sesión cerrada' };
  }
}
