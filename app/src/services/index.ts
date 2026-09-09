import { assetService } from './mock/assetService';
import { auditService } from './mock/auditService';
import { collectionService } from './mock/collectionService';
import { connectionService } from './mock/connectionService';
import { uploadService } from './mock/uploadService';
import { userService } from './mock/userService';

// Single entry point components import — swap any mock/* implementation for
// a real API-backed one here later without touching call sites.
export const services = {
  assets: assetService,
  collections: collectionService,
  users: userService,
  audit: auditService,
  connections: connectionService,
  uploads: uploadService,
};

export type { AssetService } from './mock/assetService';
export type { AuditService } from './mock/auditService';
export type { CollectionService } from './mock/collectionService';
export type { ConnectionService, ConnectionWithState } from './mock/connectionService';
export type { UploadService } from './mock/uploadService';
export type { UserService } from './mock/userService';
export * from './types';
