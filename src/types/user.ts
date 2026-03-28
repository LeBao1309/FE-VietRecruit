// ── Requests ─────────────────────────────────────────────────────────
export interface UpdateProfileRequest {
  fullName?: string
  phone?: string
  avatarUrl?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  location?: string
  dob?: string
  gender?: string
}

export interface UserRequest {
  fullName: string
  email?: string
  phone?: string
  avatarUrl?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  location?: string
  dob?: string
  gender?: string
}

export interface ExternalUrlRequest {
  url: string
}

// ── Responses ────────────────────────────────────────────────────────
export interface UserProfileResponse {
  id: string
  email: string
  fullName: string
  phone: string | null
  avatarUrl: string | null
  bannerUrl: string | null
  linkedinUrl: string | null
  githubUrl: string | null
  portfolioUrl: string | null
  location: string | null
  dob: string | null
  gender: string | null
}

export interface AdminUserResponse extends UserProfileResponse {
  companyId: string | null
  isActive: boolean
  isLocked: boolean
  failedAttempts: number
  lockUntil: string | null
  lastLoginAt: string | null
  roles: string[]
  createdAt: string
  updatedAt: string
}

export interface AvatarUploadResponse {
  avatarUrl: string
  uploadedAt: string
}

export interface BannerUploadResponse {
  bannerUrl: string
  uploadedAt: string
}
