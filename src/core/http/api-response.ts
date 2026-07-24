import { NextResponse } from "next/server";
import { AppError } from "@/core/errors/app-error";
import { ZodError } from "zod";

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function ok<T>(data: T, init?: ResponseInit, meta?: Record<string, unknown>) {
  const body: ApiSuccess<T> = { success: true, data, meta };
  return NextResponse.json(body, { status: 200, ...init });
}

export function created<T>(data: T, meta?: Record<string, unknown>) {
  const body: ApiSuccess<T> = { success: true, data, meta };
  return NextResponse.json(body, { status: 201 });
}

export function fail(error: unknown) {
  if (error instanceof AppError) {
    const body: ApiFailure = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
    return NextResponse.json(body, { status: error.status });
  }

  if (error instanceof ZodError) {
    const body: ApiFailure = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Dữ liệu không hợp lệ",
        details: error.flatten(),
      },
    };
    return NextResponse.json(body, { status: 400 });
  }

  console.error(error);
  const body: ApiFailure = {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : "Lỗi không xác định",
    },
  };
  return NextResponse.json(body, { status: 500 });
}
