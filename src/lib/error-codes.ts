export const ErrorCodes = {
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  INVALID_FIELD_VALUE: "INVALID_FIELD_VALUE",
  CONTRADICTION_DETECTED: "CONTRADICTION_DETECTED",
  RECORD_NOT_FINALISED: "RECORD_NOT_FINALISED",
  RECORD_ALREADY_FINALISED: "RECORD_ALREADY_FINALISED",
  RECORD_ARCHIVED: "RECORD_ARCHIVED",
  INCOMPLETE_RECORD: "INCOMPLETE_RECORD",
  INVALID_LANGUAGE: "INVALID_LANGUAGE",
  TRANSLATION_LOW_CONFIDENCE: "TRANSLATION_LOW_CONFIDENCE",
  UNAUTHORIZED: "UNAUTHORIZED",
  ROLE_NOT_PERMITTED: "ROLE_NOT_PERMITTED",
  FACILITY_MISMATCH: "FACILITY_MISMATCH",
  RECORD_NOT_FOUND: "RECORD_NOT_FOUND",
  RATE_LIMITED: "RATE_LIMITED",
  GENERATION_FAILED: "GENERATION_FAILED",
  GENERATION_TIMEOUT: "GENERATION_TIMEOUT",
  TRANSLATION_FAILED: "TRANSLATION_FAILED",
  AUDIT_LOG_WRITE_FAILED: "AUDIT_LOG_WRITE_FAILED",
  SUPABASE_ERROR: "SUPABASE_ERROR",
  DEEPSEEK_RATE_LIMITED: "DEEPSEEK_RATE_LIMITED",
  DEEPSEEK_AUTH_FAILED: "DEEPSEEK_AUTH_FAILED",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export const HttpStatus: Record<ErrorCode, number> = {
  [ErrorCodes.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCodes.INVALID_FIELD_VALUE]: 400,
  [ErrorCodes.CONTRADICTION_DETECTED]: 400,
  [ErrorCodes.RECORD_NOT_FINALISED]: 400,
  [ErrorCodes.RECORD_ALREADY_FINALISED]: 400,
  [ErrorCodes.RECORD_ARCHIVED]: 400,
  [ErrorCodes.INCOMPLETE_RECORD]: 400,
  [ErrorCodes.INVALID_LANGUAGE]: 400,
  [ErrorCodes.TRANSLATION_LOW_CONFIDENCE]: 200,
  [ErrorCodes.UNAUTHORIZED]: 401,
  [ErrorCodes.ROLE_NOT_PERMITTED]: 403,
  [ErrorCodes.FACILITY_MISMATCH]: 403,
  [ErrorCodes.RECORD_NOT_FOUND]: 404,
  [ErrorCodes.RATE_LIMITED]: 429,
  [ErrorCodes.GENERATION_FAILED]: 500,
  [ErrorCodes.GENERATION_TIMEOUT]: 500,
  [ErrorCodes.TRANSLATION_FAILED]: 500,
  [ErrorCodes.AUDIT_LOG_WRITE_FAILED]: 500,
  [ErrorCodes.SUPABASE_ERROR]: 500,
  [ErrorCodes.DEEPSEEK_RATE_LIMITED]: 500,
  [ErrorCodes.DEEPSEEK_AUTH_FAILED]: 500,
  [ErrorCodes.INTERNAL_SERVER_ERROR]: 500,
};

export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCodes.MISSING_REQUIRED_FIELD]: "Missing required field",
  [ErrorCodes.INVALID_FIELD_VALUE]: "Invalid value for field",
  [ErrorCodes.CONTRADICTION_DETECTED]: "Contradiction detected",
  [ErrorCodes.RECORD_NOT_FINALISED]: "Only finalised records can perform this action",
  [ErrorCodes.RECORD_ALREADY_FINALISED]: "Record is already finalised",
  [ErrorCodes.RECORD_ARCHIVED]: "Cannot perform this action on an archived record",
  [ErrorCodes.INCOMPLETE_RECORD]: "Cannot finalise: missing required fields",
  [ErrorCodes.INVALID_LANGUAGE]: "Target language must be ha, yo, or ig",
  [ErrorCodes.TRANSLATION_LOW_CONFIDENCE]: "Translation confidence is low. English version will be shown.",
  [ErrorCodes.UNAUTHORIZED]: "Not authenticated",
  [ErrorCodes.ROLE_NOT_PERMITTED]: "Your role cannot perform this action",
  [ErrorCodes.FACILITY_MISMATCH]: "You do not have access to this record",
  [ErrorCodes.RECORD_NOT_FOUND]: "Discharge record not found",
  [ErrorCodes.RATE_LIMITED]: "Too many requests. Please wait and try again.",
  [ErrorCodes.GENERATION_FAILED]: "AI generation failed. Please try again.",
  [ErrorCodes.GENERATION_TIMEOUT]: "AI generation timed out. Please try again.",
  [ErrorCodes.TRANSLATION_FAILED]: "Translation service failed. Please try again.",
  [ErrorCodes.AUDIT_LOG_WRITE_FAILED]: "Internal error. Please contact support.",
  [ErrorCodes.SUPABASE_ERROR]: "Database error. Please contact support.",
  [ErrorCodes.DEEPSEEK_RATE_LIMITED]: "AI service rate limited. Please wait and try again.",
  [ErrorCodes.DEEPSEEK_AUTH_FAILED]: "AI service authentication failed. Contact support.",
  [ErrorCodes.INTERNAL_SERVER_ERROR]: "An unexpected error occurred. Please try again.",
};

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

export function apiError(
  code: ErrorCode,
  details?: Record<string, unknown>,
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message: ErrorMessages[code],
      ...(details ? { details } : {}),
    },
  };
}
