// src/features/auth/types/auth.dto.ts
import { z } from 'zod'

// Re-export shared API envelope for backward compatibility
export { ApiResponseSchema } from '@/core/types/api.types'

// ─────────────────────────────────────────────────────────────
// 1. LOGIN
// POST /vietrecruit/auth/login
// ─────────────────────────────────────────────────────────────

export const LoginRequestSchema = z.object({
  email:    z.string({ message: 'Email không được để trống' })
             .email('Email không hợp lệ'),
  password: z.string({ message: 'Mật khẩu không được để trống' })
             .min(1, 'Mật khẩu không được để trống'),
})
export type LoginRequest = z.infer<typeof LoginRequestSchema>

export const LoginResponseSchema = z.object({
  accessToken:  z.string(),
  refreshToken: z.string(),
  expiresIn:    z.number(),
  tokenType:    z.string().default('Bearer'),
})
export type LoginResponse = z.infer<typeof LoginResponseSchema>

// ─────────────────────────────────────────────────────────────
// 2. REGISTER
// POST /vietrecruit/auth/register
// ⚠️ Spec fields: email, password (min:8,max:72), fullName (max:255), phone? (max:50)
// ⚠️ NO companyName, NO confirmPassword, NO agreeToTerms in the API payload
// ─────────────────────────────────────────────────────────────

export const RegisterRequestSchema = z
  .object({
    fullName: z
      .string({ message: 'Họ tên không được để trống' })
      .min(1,   'Họ tên không được để trống')
      .max(255, 'Họ tên quá dài'),
    email: z
      .string({ message: 'Email không được để trống' })
      .email('Email không hợp lệ'),
    password: z
      .string({ message: 'Mật khẩu không được để trống' })
      .min(8,  'Mật khẩu phải có ít nhất 8 ký tự')
      .max(72, 'Mật khẩu không được vượt quá 72 ký tự'),
    // confirmPassword: UI-only field — validated locally, NOT sent to API
    confirmPassword: z
      .string({ message: 'Vui lòng xác nhận mật khẩu' })
      .min(1, 'Vui lòng xác nhận mật khẩu'),
    phone: z
      .string()
      .max(50, 'Số điện thoại quá dài')
      .optional()
      .or(z.literal('')),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path:    ['confirmPassword'],
  })

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>

// The actual API payload strips confirmPassword before sending
export type RegisterApiPayload = Omit<RegisterRequest, 'confirmPassword'>

// ─────────────────────────────────────────────────────────────
// 3. VERIFY OTP
// POST /vietrecruit/auth/verify-otp
// ⚠️ field is "code" (not "otp") — 8-digit string
// ─────────────────────────────────────────────────────────────

export const VerifyOtpRequestSchema = z.object({
  email: z
    .string({ message: 'Email không được để trống' })
    .email('Email không hợp lệ'),
  code: z
    .string({ message: 'Vui lòng nhập mã xác thực' })
    .length(8,   'Mã xác thực phải đúng 8 chữ số')
    .regex(/^\d{8}$/, 'Mã xác thực chỉ được chứa chữ số'),
})
export type VerifyOtpRequest = z.infer<typeof VerifyOtpRequestSchema>

// ─────────────────────────────────────────────────────────────
// 4. RESEND OTP
// POST /vietrecruit/auth/resend-otp
// ─────────────────────────────────────────────────────────────

export const ResendOtpRequestSchema = z.object({
  email: z
    .string({ message: 'Email không được để trống' })
    .email('Email không hợp lệ'),
})
export type ResendOtpRequest = z.infer<typeof ResendOtpRequestSchema>

// ─────────────────────────────────────────────────────────────
// 5. REFRESH TOKEN
// POST /vietrecruit/auth/refresh
// ⚠️ Response includes BOTH new accessToken AND new refreshToken (token rotation)
// ─────────────────────────────────────────────────────────────

export const TokenRefreshRequestSchema = z.object({
  refreshToken: z.string({ message: 'Refresh token không hợp lệ' }).min(1),
})
export type TokenRefreshRequest = z.infer<typeof TokenRefreshRequestSchema>

export const TokenRefreshResponseSchema = z.object({
  accessToken:  z.string(),
  refreshToken: z.string(), // ← rotation: always save this new value
  expiresIn:    z.number(),
})
export type TokenRefreshResponse = z.infer<typeof TokenRefreshResponseSchema>

// ─────────────────────────────────────────────────────────────
// 6. LOGOUT
// POST /vietrecruit/auth/logout
// No request body — Authorization header handled by Axios interceptor
// ─────────────────────────────────────────────────────────────
// (no schema needed)

// ─────────────────────────────────────────────────────────────
// 7. FORGOT PASSWORD
// POST /vietrecruit/auth/forgot-password
// ─────────────────────────────────────────────────────────────

export const ForgotPasswordRequestSchema = z.object({
  email: z
    .string({ message: 'Email không được để trống' })
    .email('Email không hợp lệ'),
})
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>

// ─────────────────────────────────────────────────────────────
// 8. RESET PASSWORD
// POST /vietrecruit/auth/reset-password
// ⚠️ Requires token from password reset email
// ─────────────────────────────────────────────────────────────

export const ResetPasswordRequestSchema = z.object({
  email: z
    .string({ message: 'Email không được để trống' })
    .email('Email không hợp lệ'),
  token: z
    .string({ message: 'Token không hợp lệ' })
    .min(1, 'Token không được để trống'),
  newPassword: z
    .string({ message: 'Mật khẩu mới không được để trống' })
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
})
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>

// ─────────────────────────────────────────────────────────────
// 9. CHANGE PASSWORD
// POST /vietrecruit/auth/change-password
// ⚠️ Requires authenticated session — revokes all sessions on success
// ─────────────────────────────────────────────────────────────

export const ChangePasswordRequestSchema = z.object({
  currentPassword: z
    .string({ message: 'Mật khẩu hiện tại không được để trống' })
    .min(1, 'Mật khẩu hiện tại không được để trống'),
  newPassword: z
    .string({ message: 'Mật khẩu mới không được để trống' })
    .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự'),
})
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>
