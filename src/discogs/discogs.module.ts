import { Module } from '@nestjs/common';
import { DiscogsService } from './discogs.service';

@Module({
	providers: [DiscogsService],
	exports: [DiscogsService]
})
export class DiscogsModule {}
