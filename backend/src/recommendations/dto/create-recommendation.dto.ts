import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Criticality } from '@prisma/client';

export class CreateRecommendationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  source: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  missionId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  constat: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  risk: string;

  @ApiProperty({ enum: Criticality })
  @IsEnum(Criticality)
  criticality: Criticality;

  @ApiProperty()
  @IsDateString()
  dueDate: string;

  @ApiProperty()
  @IsUUID()
  directionId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiProperty()
  @IsUUID()
  responsibleId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  validatorId?: string;
}
