import { IsOptional, IsString } from "class-validator";

export class AssignEmployeeDto {
  @IsString()
  employeeId!: string;

  @IsOptional()
  @IsString()
  roleOnSite?: string;
}
