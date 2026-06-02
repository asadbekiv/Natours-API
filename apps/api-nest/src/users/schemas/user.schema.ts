import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import type { UserRole } from '@natours/shared';

export type UserDocument = HydratedDocument<User>;

@Schema({
  // Surface the `id` virtual in JSON so clients can use a stable string key.
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
  @Prop({ trim: true })
  name: string;

  @Prop({
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({ default: 'default.jpg' })
  photo: string;

  @Prop({
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  })
  role: UserRole;

  @Prop({
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  })
  password: string;

  // Not select:false — the JWT strategy needs it to detect post-token changes.
  @Prop()
  passwordChangedAt?: Date;

  @Prop({ select: false })
  passwordResetToken?: string;

  @Prop({ select: false })
  passwordResetExpires?: Date;

  @Prop({ default: true, select: false })
  active: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Hash the password whenever it is set or changed.
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Stamp passwordChangedAt on real password changes (not on initial signup).
// (Fixes the inverted condition in the original Express model.)
UserSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

// Hide deactivated accounts from all find queries.
UserSchema.pre(/^find/, function (this: { find: (q: object) => unknown }, next) {
  this.find({ active: { $ne: false } });
  (next as () => void)();
});
