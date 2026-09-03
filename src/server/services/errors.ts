export type DomainErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "LIMIT_REACHED"
  | "INVALID_TRANSITION"
  | "GEOCODING_FAILED"
  | "INTERNAL";

const HTTP_STATUS: Record<DomainErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  LIMIT_REACHED: 409,
  INVALID_TRANSITION: 409,
  GEOCODING_FAILED: 422,
  INTERNAL: 500,
};

/**
 * Error de negocio con código estable. Los servicios lo lanzan; las Server
 * Actions y los route handlers lo convierten en ActionResponse o en HTTP.
 */
export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "DomainError";
  }

  get status() {
    return HTTP_STATUS[this.code];
  }
}

export const notFound = (what: string) => new DomainError("NOT_FOUND", `${what} no existe`);
export const forbidden = (why = "No tienes permiso para esta acción") => new DomainError("FORBIDDEN", why);
