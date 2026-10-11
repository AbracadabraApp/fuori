/**
 * One-line JSON errors for Railway logs, tagged with the request's x-fuori-id
 * so a code the learner sees (E-7K2F) matches the server log line.
 */
export function logServerError(request: Request, where: string, error: unknown): void {
  console.error(
    JSON.stringify({
      level: 'error',
      id: request.headers.get('x-fuori-id') ?? undefined,
      where,
      message: error instanceof Error ? error.message : String(error),
      at: new Date().toISOString(),
    })
  );
}
