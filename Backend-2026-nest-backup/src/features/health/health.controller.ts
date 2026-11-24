import { Controller, Get, HttpStatus, Res, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { Sequelize } from 'sequelize-typescript';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(@Inject('SEQUELIZE') private readonly sequelize: Sequelize) {}

  @Get()
  @ApiOperation({ summary: 'Verificar estado de salud de la API y conexion a la base de datos' })
  @ApiResponse({ status: 200, description: 'Servicio y base de datos saludables' })
  @ApiResponse({ status: 503, description: 'Error en servicio o conexion de base de datos' })
  async checkHealth(@Res() res: Response) {
    const timestamp = new Date().toISOString();
    const uptime = process.uptime();

    try {
      await this.sequelize.authenticate();

      return res.status(HttpStatus.OK).json({
        status: 'ok',
        timestamp,
        uptime: `${uptime.toFixed(2)}s`,
        checks: {
          database: {
            status: 'up',
            dialect: this.sequelize.getDialect(),
          },
          api: {
            status: 'up',
            memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          },
        },
      });
    } catch (error: any) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'error',
        timestamp,
        uptime: `${uptime.toFixed(2)}s`,
        checks: {
          database: {
            status: 'down',
            error: error.message,
          },
          api: {
            status: 'up',
          },
        },
      });
    }
  }
}
