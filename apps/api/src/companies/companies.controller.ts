import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtPayload, UserRole } from "@savhnos/shared";
import { CompaniesService } from "./companies.service";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { CreateBranchDto } from "./dto/create-branch.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("company")
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get("me")
  getMyCompany(@CurrentUser() user: JwtPayload) {
    return this.companiesService.findById(user.companyId);
  }

  @Patch("me")
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
  updateMyCompany(@CurrentUser() user: JwtPayload, @Body() dto: UpdateCompanyDto) {
    return this.companiesService.update(user.companyId, dto);
  }

  @Get("branches")
  listBranches(@CurrentUser() user: JwtPayload) {
    return this.companiesService.listBranches(user.companyId);
  }

  @Post("branches")
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
  createBranch(@CurrentUser() user: JwtPayload, @Body() dto: CreateBranchDto) {
    return this.companiesService.createBranch(user.companyId, dto);
  }
}
