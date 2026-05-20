import { Module } from '@nestjs/common';
import { ReferentialsController } from './referentials.controller';
import { ReferentialsService } from './referentials.service';

@Module({
  controllers: [ReferentialsController],
  providers: [ReferentialsService],
})
export class ReferentialsModule {}
