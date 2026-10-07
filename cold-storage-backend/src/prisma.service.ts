import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    
    // Seed default tenant
    let tenant = await this.tenant.findUnique({ where: { id: "default" } });
    if (!tenant) {
      tenant = await this.tenant.create({ data: { id: "default", name: "Default Cold Storage" } });
    }

    // Seed default user (Maker)
    let user = await this.user.findFirst({ where: { id: "munim-local" } });
    if (!user) {
      await this.user.create({ data: { id: "munim-local", tenantId: "default", name: "Local Munim", email: "munim@test.com", password: "pwd", role: "MUNIM" } });
    }

    // Seed default Kisan
    let kisan = await this.kisan.findFirst({ where: { id: "kisan-1" } });
    if (!kisan) {
      await this.kisan.create({ data: { id: "kisan-1", tenantId: "default", accountNumber: "KHATA-001", name: "Ramesh Farmer", fatherName: "Unknown", village: "Agra", phone: "9999999999" } });
    }

    // Seed default Room
    let room = await this.room.findFirst({ where: { id: "room-1" } });
    if (!room) {
      await this.room.create({ data: { id: "room-1", tenantId: "default", name: "Chamber 1", capacity: 50000, occupiedSlots: 0, temperature: 2.5 } });
    }
  }
}
