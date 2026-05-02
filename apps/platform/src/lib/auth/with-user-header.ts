export function withUserHeader(
  userId: string | undefined,
  base?: HeadersInit,
): HeadersInit {
  const headers = new Headers(base);
  if (userId) headers.set("x-dev-user-id", userId);
  return headers;
}
