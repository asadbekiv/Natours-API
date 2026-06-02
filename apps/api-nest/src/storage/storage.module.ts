import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service';

// @Global so any module can inject StorageService without importing this one.
@Global()
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
