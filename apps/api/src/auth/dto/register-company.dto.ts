import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterCompanyDto {
  @IsString()
  @MinLength(2)
  companyName!: string;

  @IsString()
  @MinLength(2)
  ownerName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
