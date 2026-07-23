import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtPayload, UserRole } from "@savhnos/shared";
import { UsersService } from "./users.service";
import { InviteUserDto } from "./dto/invite-user.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.usersService.list(user.companyId);
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.HR)
  invite(@CurrentUser() user: JwtPayload, @Body() dto: InviteUserDto) {
    return this.usersService.invite(user.companyId, dto);
  }

  @Patch(":id/deactivate")
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.HR)
  deactivate(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.usersService.setActive(user.companyId, id, false);
  }

  @Patch(":id/activate")
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.HR)
  activate(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.usersService.setActive(user.companyId, id, true);
  }
}
