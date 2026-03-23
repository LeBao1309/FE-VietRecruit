// src/features/auth/types/auth.dto.ts
import { z } from 'zod'

// Re-export shared API envelope for backward compatibility
export { ApiResponseSchema } from '@/core/types/api.types'

// ─── Shared constants (mapped from SQL constraints) ───────────
const EMAIL_MAX = 255       // VARCHAR(255) in users table
const PASSWORD_MIN = 8      // Backend @Size(min=8)
const PASSWORD_MAX = 72     // BCrypt limit / backend @Size(max=72)
const FULLNAME_MAX = 255    // VARCHAR(255) in users table
const PHONE_MAX = 50        // VARCHAR(50) in users table
const OTP_LENGTH = 8        // 8-digit verification code

// ─── Shared field builders ────────────────────────────────────
const emailField = () =>
  z.string({ message: 'Email không được để trống' })
    .email('Email không hợp lệ')
    .max(EMAIL_MAX, `Email không được vượt quá ${EMAIL_MAX} ký tự`)

const passwordField = (label = 'Mật khẩu') =>
  z.string({ message: `${label} không được để trống` })
    .min(PASSWORD_MIN, `${label} phải có ít nhất ${PASSWORD_MIN} ký tự`)
    .max(PASSWORD_MAX, `${label} không được vượt quá ${PASSWORD_MAX} ký tự`)

// ─────────────────────────────────────────────────────────────
// 1. LOGIN
// POST /vietrecruit/auth/login
// ─────────────────────────────────────────────────────────────

export const LoginRequestSchema = z.object({
  email:    emailField(),
  password: z.string({ message: 'Mật khẩu không được để trống' })
              .min(1, 'Mật khẩu không được để trống')
              .max(PASSWORD_MAX, `Mật khẩu không được vượt quá ${PASSWORD_MAX} ký tự`),
})
export type LoginRequest = z.infer<typeof LoginRequestSchema>

// ─────────────────────────────────────────────────────────────
// Account & Role enums (shared across auth flows)
// ─────────────────────────────────────────────────────────────

export const AccountTypeEnum = z.enum(['CANDIDATE', 'EMPLOYER'])
export type AccountType = z.infer<typeof AccountTypeEnum>

// Invited staff roles (accountType stays EMPLOYER but role narrows access)
export const InvitedRoleEnum = z.enum(['HR', 'INTERVIEWER'])
export type InvitedRole = z.infer<typeof InvitedRoleEnum>

// Authenticated user shape returned in the login response
export const RoleEnum = z.enum([
  'CANDIDATE',
  'COMPANY_ADMIN',
  'HR',
  'INTERVIEWER',
  'SYSTEM_ADMIN',
  'CUSTOMER_SERVICE'
])
export type Role = z.infer<typeof RoleEnum>

export const AuthUserSchema = z.object({
  id:                     z.string(),
  email:                  z.string(),
  fullName:               z.string(),
  roles:                  z.array(RoleEnum),
  companyId:              z.string().nullable(),
  companyProfileComplete: z.boolean(),
  avatarUrl:              z.string().nullable(),
})
export type AuthUser = z.infer<typeof AuthUserSchema>

export const LoginResponseSchema = z.object({
  accessToken:  z.string(),
  refreshToken: z.string(),
  expiresIn:    z.number(),
  tokenType:    z.string().default('Bearer'),
  user:         AuthUserSchema.optional(),
})
export type LoginResponse = z.infer<typeof LoginResponseSchema>

// ─────────────────────────────────────────────────────────────
// 2. REGISTER
// POST /vietrecruit/auth/register
// ⚠️ API fields: email, password (min:8,max:72), fullName (max:255),
//    phone? (max:50), accountType (CANDIDATE | EMPLOYER)
// ⚠️ NO confirmPassword in the API payload
// ─────────────────────────────────────────────────────────────


export const RegisterRequestSchema = z
  .object({
    fullName: z
      .string({ message: 'Họ tên không được để trống' })
      .min(1,            'Họ tên không được để trống')
      .max(FULLNAME_MAX, `Họ tên không được vượt quá ${FULLNAME_MAX} ký tự`),
    email: emailField(),
    password: passwordField('Mật khẩu'),
    confirmPassword: z
      .string({ message: 'Vui lòng xác nhận mật khẩu' })
      .min(1, 'Vui lòng xác nhận mật khẩu'),
    phone: z
      .string()
      .max(PHONE_MAX, `Số điện thoại không được vượt quá ${PHONE_MAX} ký tự`)
      .optional()
      .or(z.literal('')),
    accountType: AccountTypeEnum.default('CANDIDATE'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path:    ['confirmPassword'],
  })

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>

// The actual API payload strips confirmPassword before sending
export type RegisterApiPayload = Omit<RegisterRequest, 'confirmPassword'>

// ─────────────────────────────────────────────────────────────
// 2b. REGISTER BY INVITE
// POST /vietrecruit/auth/register/invite
// Fields: token (required), password (min:8,max:72), fullName (max:255)
// ─────────────────────────────────────────────────────────────

export const RegisterByInviteRequestSchema = z
  .object({
    token: z
      .string({ message: 'Token mời không hợp lệ' })
      .min(1, 'Token mời không được để trống'),
    fullName: z
      .string({ message: 'Họ tên không được để trống' })
      .min(1,            'Họ tên không được để trống')
      .max(FULLNAME_MAX, `Họ tên không được vượt quá ${FULLNAME_MAX} ký tự`),
    password: passwordField('Mật khẩu'),
    confirmPassword: z
      .string({ message: 'Vui lòng xác nhận mật khẩu' })
      .min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path:    ['confirmPassword'],
  })

export type RegisterByInviteRequest = z.infer<typeof RegisterByInviteRequestSchema>

// API payload strips confirmPassword
export type RegisterByInviteApiPayload = Omit<RegisterByInviteRequest, 'confirmPassword'>

// ─────────────────────────────────────────────────────────────
// 3. VERIFY OTP
// POST /vietrecruit/auth/verify-otp
// ⚠️ field is "code" (not "otp") — 8-digit string
// ─────────────────────────────────────────────────────────────

export const VerifyOtpRequestSchema = z.object({
  email: emailField(),
  code: z
    .string({ message: 'Vui lòng nhập mã xác thực' })
    .length(OTP_LENGTH, `Mã xác thực phải đúng ${OTP_LENGTH} chữ số`)
    .regex(/^\d{8}$/, 'Mã xác thực chỉ được chứa chữ số'),
})
export type VerifyOtpRequest = z.infer<typeof VerifyOtpRequestSchema>

// ─────────────────────────────────────────────────────────────
// 4. RESEND OTP
// POST /vietrecruit/auth/resend-otp
// ─────────────────────────────────────────────────────────────

export const ResendOtpRequestSchema = z.object({
  email: emailField(),
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
  email: emailField(),
})
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>

// ─────────────────────────────────────────────────────────────
// 8. RESET PASSWORD
// POST /vietrecruit/auth/reset-password
// ⚠️ Requires token from password reset email
// ─────────────────────────────────────────────────────────────

export const ResetPasswordRequestSchema = z.object({
  email: emailField(),
  token: z
    .string({ message: 'Token không hợp lệ' })
    .min(1, 'Token không được để trống'),
  newPassword: passwordField('Mật khẩu mới'),
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
  newPassword: passwordField('Mật khẩu mới'),
})
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>
