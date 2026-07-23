import { IsEmail, IsEnum, IsString, MinLength } from "class-validator";
import { UserRole } from "@savhnos/shared";

export class InviteUserDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(UserRole)
  role!: UserRole;
}
