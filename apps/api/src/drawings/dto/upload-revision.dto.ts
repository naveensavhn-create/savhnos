import { IsOptional, IsString } from "class-validator";

export class UploadRevisionDto {
  @IsString()
  versionLabel!: string;

  @IsString()
  fileUrl!: string;

  @IsOptional()
  @IsString()
  fileType?: string;
}
