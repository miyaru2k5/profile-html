export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "DOMAIN_VERIFICATION_FAILED"
  | "BILLING_ERROR"
  | "STORAGE_ERROR"
  | "AI_ERROR";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, status = 400, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }

  static notFound(resource: string, id?: string): AppError {
    return new AppError(
      "NOT_FOUND",
      id ? `Không tìm thấy ${resource} '${id}'` : `Không tìm thấy ${resource}`,
      404,
    );
  }

  static unauthorized(message = "Chưa xác thực"): AppError {
    return new AppError("UNAUTHORIZED", message, 401);
  }

  static forbidden(message = "Không có quyền truy cập"): AppError {
    return new AppError("FORBIDDEN", message, 403);
  }

  static conflict(message: string): AppError {
    return new AppError("CONFLICT", message, 409);
  }

  static validation(message: string, details?: unknown): AppError {
    return new AppError("VALIDATION_ERROR", message, 400, details);
  }

  static internal(message = "Lỗi máy chủ nội bộ"): AppError {
    return new AppError("INTERNAL_ERROR", message, 500);
  }
}
