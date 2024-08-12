import { Module } from '@nestjs/common';
import { BandcampService } from './bandcamp.service';
import { HttpModule } from '@nestjs/axios';

@Module({
	imports: [HttpModule],
	providers: [BandcampService],
	exports: [BandcampService]
})
export class BandcampModule {}
