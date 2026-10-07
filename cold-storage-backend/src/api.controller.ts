import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Controller('api')
export class ApiController {
  constructor(private readonly prisma: PrismaService) {}

  // ==============================
  // KISANS (Farmers)
  // ==============================
  @Get('kisans')
  async getKisans() {
    return this.prisma.kisan.findMany();
  }

  @Post('kisans')
  async createKisan(@Body() data: any) {
    return this.prisma.kisan.create({ data });
  }

  @Put('kisans/:id')
  async updateKisan(@Param('id') id: string, @Body() data: any) {
    return this.prisma.kisan.update({ where: { id }, data });
  }

  // ==============================
  // ROOMS
  // ==============================
  @Get('rooms')
  async getRooms() {
    return this.prisma.room.findMany();
  }

  @Post('rooms')
  async createRoom(@Body() data: any) {
    return this.prisma.room.create({ data });
  }

  // ==============================
  // AMAD (Inward)
  // ==============================
  @Get('amad_slips')
  async getAmadSlips() {
    return this.prisma.amadSlip.findMany();
  }

  @Post('amad_slips')
  async createAmadSlip(@Body() data: any) {
    const { tenantId, kisanId, roomId, makerId, ...rest } = data;
    return this.prisma.amadSlip.create({ 
      data: {
        ...rest,
        tenant: { connect: { id: tenantId } },
        kisan: { connect: { id: kisanId } },
        room: { connect: { id: roomId } },
        maker: { connect: { id: makerId } }
      } 
    });
  }

  @Put('amad_slips/:id')
  async updateAmadSlip(@Param('id') id: string, @Body() data: any) {
    return this.prisma.amadSlip.update({ where: { id }, data });
  }

  // ==============================
  // NIKASI (Outward)
  // ==============================
  @Get('nikasi_slips')
  async getNikasiSlips() {
    return this.prisma.nikasiSlip.findMany();
  }

  @Post('nikasi_slips')
  async createNikasiSlip(@Body() data: any) {
    return this.prisma.nikasiSlip.create({ data });
  }

  @Put('nikasi_slips/:id')
  async updateNikasiSlip(@Param('id') id: string, @Body() data: any) {
    return this.prisma.nikasiSlip.update({ where: { id }, data });
  }
}
