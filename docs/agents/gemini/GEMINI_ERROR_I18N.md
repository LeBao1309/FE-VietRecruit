# GEMINI_ERROR_I18N.md -- Error Handling & Internationalization Domain Agent Brief

> Target Agent: Gemini | Domain: Error Code Mapping, Vietnamese i18n, Notifications
> Dependencies: BE_CONTRACT.md, BUG_REGISTER.md (BUG-004)

---

## Domain Scope

Complete rewrite of error code mapping, Vietnamese translation of all UI strings, notification system.

## FE Files to Modify

| File | Purpose |
|------|---------|
| `src/core/utils/error.utils.ts` | ERROR_CODE_MAP (COMPLETE REWRITE) |
| `src/core/constants/pipeline-stages.ts` | English labels -> Vietnamese |
| `src/core/constants/enums.ts` | Remove phantom values, fix spelling |

## BUG-004: Complete Error Code Mapping Rewrite

Current state: 7 mappings, 0 match BE codes. Every error shows raw English.

### Required ERROR_CODE_MAP (all 77 BE codes)

```typescript
const ERROR_CODE_MAP: Record<string, string> = {
  // Generic
  'VALIDATION_ERROR':          'Du lieu gui len khong hop le.',
  'BAD_REQUEST':               'Yeu cau khong hop le.',
  'NOT_FOUND':                 'Khong tim thay du lieu yeu cau.',
  'FORBIDDEN':                 'Ban khong co quyen truy cap.',
  'UNAUTHORIZED':              'Vui long dang nhap de tiep tuc.',
  'INTERNAL_ERROR':            'Da xay ra loi he thong. Vui long thu lai sau.',
  'TOO_MANY_REQUESTS':         'Ban da thu qua nhieu lan. Vui long thu lai sau.',
  'SERVICE_UNAVAILABLE':       'Dich vu tam thoi khong kha dung. Vui long thu lai sau.',

  // Auth
  'AUTH_INVALID_CREDENTIALS':  'Email hoac mat khau khong chinh xac.',
  'AUTH_TOKEN_EXPIRED':        'Phien dang nhap da het han. Vui long dang nhap lai.',
  'AUTH_TOKEN_INVALID':        'Phien dang nhap khong hop le.',
  'AUTH_REFRESH_TOKEN_EXPIRED':'Phien dang nhap da het han. Vui long dang nhap lai.',
  'AUTH_REFRESH_TOKEN_INVALID':'Phien dang nhap khong hop le. Vui long dang nhap lai.',
  'AUTH_ACCOUNT_LOCKED':       'Tai khoan da bi khoa tam thoi do dang nhap sai qua nhieu lan.',
  'AUTH_ACCOUNT_INACTIVE':     'Tai khoan khong hoat dong.',
  'AUTH_PASSWORD_MISMATCH':    'Mat khau hien tai khong chinh xac.',
  'AUTH_RESET_TOKEN_INVALID':  'Lien ket dat lai mat khau khong hop le hoac da het han.',
  'AUTH_OTP_INVALID':          'Ma xac thuc khong chinh xac.',
  'AUTH_OTP_EXPIRED':          'Ma xac thuc da het han.',
  'AUTH_OTP_COOLDOWN':         'Vui long cho truoc khi yeu cau ma moi.',
  'AUTH_OTP_LOCKED':           'Qua nhieu lan thu. Vui long thu lai sau.',
  'AUTH_EMAIL_NOT_VERIFIED':   'Dia chi email chua duoc xac thuc.',

  // User
  'USER_USERNAME_CONFLICT':    'Ten nguoi dung da ton tai.',
  'USER_EMAIL_CONFLICT':       'Email nay da duoc dang ky.',

  // Subscription
  'SUBSCRIPTION_REQUIRED':     'Can co goi dang ky de su dung tinh nang nay.',
  'SUBSCRIPTION_EXPIRED':      'Goi dang ky cua ban da het han.',
  'SUBSCRIPTION_ALREADY_ACTIVE':'Ban da co goi dang ky dang hoat dong.',
  'QUOTA_EXCEEDED':            'Da dat gioi han so luong tin tuyen dung cho goi cua ban.',
  'PLAN_NOT_FOUND':            'Khong tim thay goi dang ky.',

  // Payment
  'PAYMENT_CREATION_FAILED':   'Khong the tao lien ket thanh toan. Vui long thu lai.',
  'PAYMENT_NOT_FOUND':         'Khong tim thay giao dich thanh toan.',
  'PAYMENT_ALREADY_PENDING':   'Da co giao dich dang cho xu ly.',
  'PAYMENT_EXPIRED':           'Lien ket thanh toan da het han.',
  'PAYMENT_ACTIVATION_FAILED': 'Khong the kich hoat goi dang ky. Vui long lien he ho tro.',
  'PAYMENT_WEBHOOK_INVALID_SIGNATURE': 'Chu ky webhook khong hop le.',

  // Candidate/File
  'CANDIDATE_NOT_FOUND':       'Khong tim thay ho so ung vien.',
  'CANDIDATE_CV_INVALID_TYPE': 'Chi chap nhan file CV dinh dang PDF.',
  'CANDIDATE_CV_SIZE_EXCEEDED':'Kich thuoc file CV vuot qua gioi han cho phep.',
  'STORAGE_UNAVAILABLE':       'Dich vu luu tru tam thoi khong kha dung.',
  'FILE_TOO_LARGE':            'Kich thuoc file vuot qua gioi han cho phep.',
  'FILE_TYPE_NOT_ALLOWED':     'Dinh dang file khong duoc ho tro.',
  'USER_AVATAR_INVALID_TYPE':  'Dinh dang anh dai dien khong hop le.',
  'USER_AVATAR_SIZE_EXCEEDED': 'Kich thuoc anh dai dien vuot qua gioi han.',
  'USER_BANNER_INVALID_TYPE':  'Dinh dang anh bia khong hop le.',
  'USER_BANNER_SIZE_EXCEEDED': 'Kich thuoc anh bia vuot qua gioi han.',

  // Application
  'APPLICATION_NOT_FOUND':     'Khong tim thay don ung tuyen.',
  'APPLICATION_DUPLICATE':     'Ban da ung tuyen cho vi tri nay roi.',
  'APPLICATION_INVALID_TRANSITION': 'Khong the chuyen trang thai don ung tuyen.',
  'APPLICATION_CV_REQUIRED':   'Can tai len CV truoc khi ung tuyen.',
  'JOB_NOT_PUBLISHED':         'Tin tuyen dung khong con kha dung.',

  // Interview
  'INTERVIEW_NOT_FOUND':       'Khong tim thay lich phong van.',
  'INTERVIEW_INVALID_STATUS':  'Trang thai phong van khong hop le.',
  'INTERVIEW_INVALID_INTERVIEWER': 'Nguoi phong van khong hop le.',
  'INTERVIEW_INVALID_STATUS_TRANSITION': 'Khong the chuyen trang thai phong van.',

  // Scorecard
  'SCORECARD_NOT_FOUND':       'Khong tim thay phieu danh gia.',
  'SCORECARD_DUPLICATE':       'Ban da nop phieu danh gia cho buoi phong van nay.',
  'SCORECARD_NOT_ELIGIBLE':    'Ban khong duoc phan cong cho buoi phong van nay.',
  'SCORECARD_INTERVIEW_NOT_READY': 'Buoi phong van chua hoan thanh.',

  // Offer
  'OFFER_NOT_FOUND':           'Khong tim thay thu moi lam viec.',
  'OFFER_ALREADY_EXISTS':      'Da co thu moi dang hoat dong cho don ung tuyen nay.',
  'OFFER_INVALID_TRANSITION':  'Khong the chuyen trang thai thu moi.',
  'OFFER_APPLICATION_NOT_READY': 'Don ung tuyen chua san sang de tao thu moi.',

  // Invitation
  'INVITATION_NOT_FOUND':      'Khong tim thay loi moi.',
  'INVITATION_EXPIRED':        'Loi moi da het han.',
  'INVITATION_ALREADY_ACCEPTED':'Loi moi da duoc chap nhan.',
  'INVALID_ACCOUNT_TYPE':      'Loai tai khoan phai la UNG VIEN hoac NHA TUYEN DUNG.',
  'INVALID_INVITATION_ROLE':   'Chi co the moi vai tro HR hoac Nguoi phong van.',
  'ROLE_GROUP_VIOLATION':      'Vi pham nhom vai tro.',

  // AI
  'AI_SERVICE_UNAVAILABLE':    'Dich vu AI tam thoi khong kha dung.',
  'AI_INVALID_RESPONSE':       'Dich vu AI tra ve ket qua khong hop le.',
  'CV_NOT_PARSED':             'Chua co noi dung CV. Vui long tai len CV truoc.',
  'CV_IMPROVEMENT_UNAVAILABLE':'Phan tich CV tam thoi khong kha dung.',
  'INTERVIEW_QUESTIONS_UNAVAILABLE': 'Tao cau hoi phong van tam thoi khong kha dung.',
  'CV_NOT_AVAILABLE_FOR_INTERVIEW': 'Khong co CV de tao cau hoi phong van.',
  'SALARY_BENCHMARK_UNAVAILABLE': 'So sanh luong tam thoi khong kha dung.',
  'JD_GENERATION_UNAVAILABLE': 'Tao mo ta cong viec tam thoi khong kha dung.',

  // Other
  'DEPARTMENT_NOT_FOUND':      'Khong tim thay phong ban.',
  'NOTIFICATION_SEND_FAILED':  'Gui thong bao that bai.',
  'CONCURRENT_MODIFICATION':   'Du lieu da bi thay doi boi yeu cau khac. Vui long thu lai.',
  'CONFLICT':                  'Du lieu da ton tai.',
}
```

### Also Fix

1. **Remove old AUTH_001-006 mappings** -- they never matched anything
2. **Update FALLBACK_MESSAGE** -- keep as generic Vietnamese fallback
3. **Remove raw English fallback on line 41** -- replace with:
   ```typescript
   // If code exists but not mapped, use category-based fallback
   if (backendCode) {
     if (backendCode.startsWith('AUTH_')) return 'Loi xac thuc. Vui long thu lai.'
     if (backendCode.startsWith('PAYMENT_')) return 'Loi thanh toan. Vui long thu lai.'
     return FALLBACK_MESSAGE
   }
   ```

## Enum Fixes

In `enums.ts`:
1. Remove `EMPLOYER` from `USER_ROLES`
2. Remove `EXPIRED` from `JOB_STATUS`
3. Change `CANCELLED` to `CANCELED` in `INTERVIEW_STATUS`
4. Remove `NO_SHOW` from `INTERVIEW_STATUS`
5. Remove `EXPIRED` from `OFFER_STATUS`

## Pipeline Labels

In `pipeline-stages.ts`, replace English with Vietnamese (see GEMINI_WORKSPACE.md).

## Testing

- Error utils: test every BE error code maps to Vietnamese
- Fallback: test unknown codes get generic Vietnamese
- Network error: test offline scenario
- 429 rate limit: test rate limit message
