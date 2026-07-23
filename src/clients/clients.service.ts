import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  list(companyId: string) {
    return this.prisma.client.findMany({
      where: { companyId },
      include: { _count: { select: { projects: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(companyId: string, id: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, companyId },
      include: { projects: true, invoices: true },
    });
    if (!client) throw new NotFoundException("Client not found");
    return client;
  }

  create(companyId: string, dto: CreateClientDto) {
    return this.prisma.client.create({ data: { ...dto, companyId } });
  }

  async update(companyId: string, id: string, dto: UpdateClientDto) {
    const client = await this.prisma.client.findFirst({ where: { id, companyId } });
    if (!client) throw new NotFoundException("Client not found");
    return this.prisma.client.update({ where: { id }, data: dto });
  }
}
