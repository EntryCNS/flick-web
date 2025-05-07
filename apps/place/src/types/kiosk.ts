export type KioskStatus = "ACTIVE" | "INACTIVE" | "REVOKED";

export interface Kiosk {
  id: number;
  name: string;
  deviceId: string;
  lastConnected: string | null;
  status: KioskStatus;
  createdAt: string;
}

export interface GenerateOtpResponse {
  otpCode: string;
  expiresAt: string;
}

export interface RegisterKioskRequest {
  name: string;
  deviceId: string;
  otpCode: string;
}

export interface UpdateKioskRequest {
  name?: string;
  status?: KioskStatus;
}
