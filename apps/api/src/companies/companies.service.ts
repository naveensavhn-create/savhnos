import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { CreateBranchDto } from "./dto/create-branch.dto";

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  findById(companyId: string) {
    return this.prisma.company.findUnique({ where: { id: companyId } });
  }

  update(companyId: string, dto: UpdateCompanyDto) {
    return this.prisma.company.update({ where: { id: companyId }, data: dto });
  }

  listBranches(companyId: string) {
    return this.prisma.branch.findMany({ where: { companyId }, orderBy: { name: "asc" } });
  }

  createBranch(companyId: string, dto: CreateBranchDto) {
    return this.prisma.branch.create({ data: { ...dto, companyId } });
  }
}
