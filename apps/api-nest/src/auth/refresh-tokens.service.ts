import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refresh-token.schema';

/**
 * Manages opaque refresh tokens with rotation + reuse detection.
 *
 * Tokens are random 96-char hex strings; only their sha256 hash is stored,
 * so a DB compromise doesn't leak usable tokens. Each /refresh rotates the
 * token; presenting an already-revoked one revokes the user's entire active
 * set (likely-theft signal).
 */
@Injectable()
export class RefreshTokensService {
  private readonly ttlMs: number;

  constructor(
    @InjectModel(RefreshToken.name)
    private readonly tokenModel: Model<RefreshTokenDocument>,
    config: ConfigService,
  ) {
    const days =
      Number(config.get<string>('REFRESH_TOKEN_EXPIRES_DAYS')) || 90;
    this.ttlMs = days * 24 * 60 * 60 * 1000;
  }

  private hash(raw: string): string {
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  /** Issue a new refresh token for a user. Returns the raw token. */
  async issue(userId: string | Types.ObjectId): Promise<string> {
    const raw = crypto.randomBytes(48).toString('hex');
    await this.tokenModel.create({
      tokenHash: this.hash(raw),
      user: userId,
      expiresAt: new Date(Date.now() + this.ttlMs),
    });
    return raw;
  }

  /** Validate + rotate. Throws Unauthorized if invalid/expired/reused. */
  async rotate(raw: string): Promise<{ userId: string; newRaw: string }> {
    const existing = await this.tokenModel
      .findOne({ tokenHash: this.hash(raw) })
      .exec();
    if (!existing) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (existing.revokedAt) {
      // Reuse of a revoked token → probable theft. Burn all sessions.
      await this.revokeAllForUser(existing.user);
      throw new UnauthorizedException(
        'Refresh token reuse detected; please log in again',
      );
    }
    if (existing.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const userId = existing.user.toString();
    const newRaw = await this.issue(existing.user);
    existing.revokedAt = new Date();
    existing.replacedByHash = this.hash(newRaw);
    await existing.save();
    return { userId, newRaw };
  }

  /** Revoke a single token (logout). Silently no-ops if unknown/revoked. */
  async revoke(raw: string): Promise<void> {
    await this.tokenModel.updateOne(
      { tokenHash: this.hash(raw), revokedAt: { $exists: false } },
      { $set: { revokedAt: new Date() } },
    );
  }

  async revokeAllForUser(userId: string | Types.ObjectId): Promise<void> {
    await this.tokenModel.updateMany(
      { user: userId, revokedAt: { $exists: false } },
      { $set: { revokedAt: new Date() } },
    );
  }
}
