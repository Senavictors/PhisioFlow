export function serializeSession<T extends { expectedFee?: unknown }>(session: T) {
  return {
    ...session,
    expectedFee:
      session.expectedFee != null && typeof (session.expectedFee as { toString?: () => string }).toString === 'function'
        ? (session.expectedFee as { toString: () => string }).toString()
        : null,
  }
}
