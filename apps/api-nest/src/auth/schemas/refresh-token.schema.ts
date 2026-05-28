import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class RefreshToken {
  /** sha256 of the raw token — we never store the raw value. */
  @Prop({ required: true, unique: true })
  tokenHash: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  expiresAt: Date;

  /** Set when the token is rotated (replaced) or explicitly revoked. */
  @Prop()
  revokedAt?: Date;

  /** Hash of the token that replaced this one — used for reuse-detection chains. */
  @Prop()
  replacedByHash?: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

RefreshTokenSchema.index({ user: 1 });
// TTL — Mongo auto-deletes documents once expiresAt is past.
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
