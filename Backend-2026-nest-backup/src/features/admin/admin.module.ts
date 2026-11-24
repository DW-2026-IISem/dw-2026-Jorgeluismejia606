import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BcryptPasswordHasherService } from '../../infrastructure/security/hashing/bcrypt-password-hasher.service';
import {
  ConcesionesController,
  RecursosController,
  RolesController,
  UsuariosController,
} from './admin.controllers';
import { AdminService } from './admin.service';

/** Administración del RBAC: usuarios, roles, recursos y concesiones. */
@Module({
  imports: [AuthModule],
  controllers: [UsuariosController, RolesController, RecursosController, ConcesionesController],
  providers: [AdminService, BcryptPasswordHasherService],
})
export class AdminModule {}
