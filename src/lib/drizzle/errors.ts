// SQLSTATE for a Postgres unique-constraint violation.
const UNIQUE_VIOLATION = '23505';

// drizzle wraps driver errors (e.g. in DrizzleQueryError), so the Postgres `DatabaseError`
// carrying `code`/`constraint` is reached via the `cause` chain rather than the top level.
const MAX_CAUSE_DEPTH = 4;

/**
 * True when `error` (or anything in its `cause` chain) is a Postgres unique-constraint
 * violation (SQLSTATE `23505`). Pass `constraint` to additionally require a specific
 * constraint/index name — e.g. to map only the `one_active_job_hunt_per_user` index to a
 * friendly conflict result and let any other unique violation surface as a generic error.
 */
export function isUniqueViolation(error: unknown, constraint?: string): boolean {
  for (let current: unknown = error, depth = 0; depth < MAX_CAUSE_DEPTH; depth += 1) {
    if (typeof current !== 'object' || current === null) {
      return false;
    }

    const candidate = current as { code?: unknown; constraint?: unknown; cause?: unknown };

    if (candidate.code === UNIQUE_VIOLATION) {
      return constraint === undefined || candidate.constraint === constraint;
    }

    current = candidate.cause;
  }

  return false;
}
