import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { JwtPayload, UserRole } from "@savhnos/shared";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterCompanyDto } from "./dto/register-company.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async registerCompany(dto: RegisterCompanyDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const company = await this.prisma.company.create({
      data: {
        name: dto.companyName,
        users: {
          create: {
            email: dto.email,
            name: dto.ownerName,
            passwordHash,
            role: UserRole.OWNER,
          },
        },
      },
      include: { users: true },
    });

    const owner = company.users[0];
    return this.issueToken({
      sub: owner.id,
      email: owner.email,
      companyId: company.id,
      role: owner.role as UserRole,
    });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return this.issueToken({
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role as UserRole,
    });
  }

  private issueToken(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload);
    return { accessToken, user: payload };
  }
}
