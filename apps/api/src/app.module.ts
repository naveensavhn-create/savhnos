import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { CompaniesModule } from "./companies/companies.module";
import { UsersModule } from "./users/users.module";
import { EmployeesModule } from "./employees/employees.module";
import { ProjectsModule } from "./projects/projects.module";
import { AttendanceModule } from "./attendance/attendance.module";
import { ClientsModule } from "./clients/clients.module";
import { DrawingsModule } from "./drawings/drawings.module";
import { DashboardModule } from "./dashboard/dashboard.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CompaniesModule,
    UsersModule,
    EmployeesModule,
    ProjectsModule,
    AttendanceModule,
    ClientsModule,
    DrawingsModule,
    DashboardModule,
  ],
})
export class AppModule {}
