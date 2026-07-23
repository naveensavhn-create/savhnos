import { IsOptional, IsString } from "class-validator";

export class CreateDrawingDto {
  @IsString()
  projectId!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  discipline?: string;
}
