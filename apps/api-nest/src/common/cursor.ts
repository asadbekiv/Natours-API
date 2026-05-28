/**
 * A returned `CursorPage` is recognised by the TransformInterceptor and
 * unwrapped into the envelope `{ status, results, data, nextCursor? }`.
 */
export class CursorPage<T> {
  constructor(
    public readonly items: T[],
    public readonly nextCursor?: string,
  ) {}
}

/** Opaque encode/decode — keeps the wire format independent of the field. */
export function encodeCursor(value: string | { toString(): string }): string {
  return Buffer.from(String(value), 'utf8').toString('base64url');
}

export function decodeCursor(cursor: string): string | null {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    return decoded.length > 0 ? decoded : null;
  } catch {
    return null;
  }
}
