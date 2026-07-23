import { IsEmail, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { PipelineStage } from "@savhnos/shared";

export class CreateClientDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  organization?: string;

  @IsOptional()
  @IsEnum(PipelineStage)
  pipelineStage?: PipelineStage;

  @IsOptional()
  @IsNumber()
  estimatedValue?: number;
}
