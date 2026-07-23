import { IsEnum, IsOptional, IsString } from "class-validator";
import { DrawingStatus } from "@savhnos/shared";

export class ReviewRevisionDto {
  @IsEnum(DrawingStatus)
  decision!: DrawingStatus;

  @IsOptional()
  @IsString()
  comments?: string;
}
