/** Nhãn trạng thái / enum hiển thị tiếng Việt */

export const PROFILE_STATUS_VI: Record<string, string> = {
  DRAFT: "Nháp",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Lưu trữ",
  SUSPENDED: "Tạm khóa",
};

export const DOMAIN_STATUS_VI: Record<string, string> = {
  PENDING: "Chờ xác minh",
  VERIFYING: "Đang xác minh",
  ACTIVE: "Hoạt động",
  FAILED: "Thất bại",
  DISABLED: "Tắt",
};

export const DOMAIN_TYPE_VI: Record<string, string> = {
  SUBDOMAIN: "Subdomain",
  CUSTOM: "Tùy chỉnh",
};

export const CRM_STATUS_VI: Record<string, string> = {
  NEW: "Mới",
  CONTACTED: "Đã liên hệ",
  QUALIFIED: "Tiềm năng",
  WON: "Thành công",
  LOST: "Thất bại",
};

export const SUBSCRIPTION_STATUS_VI: Record<string, string> = {
  TRIALING: "Dùng thử",
  ACTIVE: "Đang hoạt động",
  PAST_DUE: "Quá hạn",
  CANCELED: "Đã hủy",
  INCOMPLETE: "Chưa hoàn tất",
};

export const PLAN_INTERVAL_VI: Record<string, string> = {
  MONTHLY: "tháng",
  YEARLY: "năm",
};

export function viLabel(map: Record<string, string>, key: string): string {
  return map[key] ?? key;
}
