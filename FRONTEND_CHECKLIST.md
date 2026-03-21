# Frontend Implementation Checklist - VietRecruit

Dựa trên phân tích tài liệu API (`api.json`), Database schemas (`script_db.sql`) và Flow Documents, dưới đây là danh sách phân chia các tính năng chi tiết cần triển khai phía Frontend, được gom nhóm theo các Module chức năng (Functional Modules) và chuẩn hóa theo phân quyền.

## 1. Module Xác Thực & Onboarding (Auth & Onboarding - Public / All Roles)
- [x] **Đăng ký / Đăng nhập** (Service `auth.service.ts` + Zod DTOs + Pinia Store hoàn chỉnh)
  - [x] Trang Đăng ký (Chọn Account Type: Candidate hoặc Employer)
  - [x] Xác thực OTP qua Email (`/auth/verify-otp`)
  - [x] Trang Đăng nhập (Hỗ trợ trả về Access/Refresh Token)
  - [x] Chức năng Quên mật khẩu / Reset Mật khẩu (Implemented in service)
  - [x] **Đăng ký theo lời mời** (Flow: `POST /auth/register/invite` — InviteRegisterPage.vue)
- [x] **Thiết lập tài khoản (Onboarding)**
  - [x] Employer Onboarding: Cập nhật thông tin công ty lần đầu (`PUT /companies/me` — EmployerOnboardingPage.vue)
  - [x] Candidate Onboarding: Cập nhật thông tin cá nhân bổ sung sau khi xác thực (`PUT /candidates/me` — CandidateOnboardingPage.vue)

## 2. Module Công ty & Tổ chức (Company Management - Role: COMPANY_ADMIN)
- [x] **Hồ sơ Công ty** (Company Service + Pinia Store + CompanySettingsPage.vue)
  - [x] Trang cập nhật thông tin công ty (Tên, Domain, Website, Ngành nghề)
- [x] **Cấu trúc Tổ chức**
  - [x] Thêm / Sửa / Xóa Phòng ban (Departments)
  - [x] Thêm / Sửa / Xóa Địa điểm làm việc (Locations)
  - [x] Thêm / Sửa / Xóa Danh mục công việc (Categories)
- [x] **Quản lý Thành viên**
  - [x] Mời HR / Interviewer vào Workspace của công ty (`/invitations` flow)
  - [x] Phân quyền thành viên trong công ty (dựa vào Role HR, INTERVIEWER)

## 3. Module Gói Cước & Thanh Toán (Subscription & Payment - Role: COMPANY_ADMIN)
- [x] **Gói cước (Plans)** (Đã có `plan.service.ts`)
  - [x] Trang hiển thị danh sách các gói cước (Lấy từ API `subscription_plans`)
  - [x] Giao diện xác nhận đăng ký / Nâng cấp gói cước
- [x] **Thanh toán & Quota** (CHƯA LÀM - Thiếu `Payment Service`, `Subscription Service`)
  - [x] Tích hợp luồng Checkout thanh toán qua PayOS (Nhận link và redirect)
  - [x] Trang theo dõi trạng thái giao dịch (Thành công / Thất bại) sau khi từ PayOS trả về
  - [x] Dashboard theo dõi Quota (Số Job khả dụng, Thời hạn chu kỳ)
  - [x] Chức năng Hủy gia hạn gói cước (Cancel Subscription)

## 4. Module Quản Lý Việc Làm (Job Management - Role: HR / COMPANY_ADMIN)
- [/] **Danh sách Công việc** (UI MOCK - Thiếu `Job Service`)
  - [ ] Bảng danh sách Job nội bộ (Lọc theo trạng thái: DRAFT, PUBLISHED, CLOSED)
- [ ] **Tạo & Quản lý Job** (CHƯA LÀM - Thiếu `Job Service`)
  - [ ] Form tạo Job (Chọn Department, Location, Category, Lương, Yêu cầu...)
  - [ ] Chức năng Publish Job (Kèm logic kiểm tra hạn mức / Quota của gói)
  - [ ] Chức năng Đóng (Close) Job
  - [ ] Sửa việc làm đang ở trạng thái DRAFT

## 5. Module Quản Lý Đường Ống Ứng Viên (ATS Pipeline - Role: HR)
- [/] **Bảng Kanban Đường ống (Pipeline)** (UI MOCK - Thiếu `Application Service`)
  - [ ] Giao diện Board kéo thả theo cột trạng thái (NEW -> SCREENING -> INTERVIEW -> OFFER -> HIRED -> REJECTED)
  - [ ] Kéo thả cập nhật trạng thái Application (Gọi API cập nhật lịch sử trạng thái)
- [ ] **Đánh giá AI (AI Screening)** (CHƯA LÀM)
  - [ ] Nút Trigger kích hoạt AI đánh giá hàng loạt CV cho Job
  - [ ] Hiển thị danh sách Application kèm điểm số `aiScore` từ cao xuống thấp
- [/] **Chi tiết Ứng tuyển (Application Detail)** (UI MOCK)
  - [ ] Xem nội dung đơn ứng tuyển, Cover Letter
  - [ ] Xem và Tải CV của ứng viên
  - [ ] Lịch sử trạng thái ứng tuyển (Status History)

## 6. Module Phỏng Vấn & Đánh Giá (Interview & Scorecard - Role: HR / INTERVIEWER)
- [/] **Lịch Phỏng Vấn (Interviews)** (UI MOCK - Thiếu `Interview Service`)
  - [ ] Dialog Tạo/Lên lịch phỏng vấn (Thời gian, Hình thức/Link Meet, Chọn Interviewers)
  - [ ] Hiển thị danh sách Lịch phỏng vấn sắp tới (Dashboard cho Interviewer và HR)
  - [ ] Cập nhật trạng thái Phỏng vấn (SCHEDULED -> COMPLETED hoặc CANCELED)
- [/] **Phiếu Đánh Giá (Scorecard)** (UI MOCK - Thiếu `Scorecard Service`)
  - [ ] Form điền điểm đánh giá của Interviewer (Skill, Attitude, English, Kết quả: PASS/FAIL/CONSIDERING)
  - [ ] Hiển thị bảng tổng hợp kết quả / điểm trung bình từ các Interviewer (Cho HR xem)
  - [ ] Tích hợp `GET /interviews/{id}/scorecards` để xem kết quả đánh giá.

## 7. Module Chào Giá (Offer Management - Role: HR)
- [x] **Tạo và Gửi Offer** (HOÀN TẤT - Đã có `Offer Service` & `Application Service` thực tế)
  - [x] Tích hợp lấy danh sách Ứng viên (Application) làm base query
  - [x] Form tạo Offer letter (Lương cơ bản, Đơn vị tiền tệ, Ngày bắt đầu, Gắn link file) - Trạng thái DRAFT
  - [x] Chức năng "Send Offer" gởi tới ứng viên
  - [x] Theo dõi phản hồi Offer từ Candidate (ACCEPTED, DECLINED) (Kết nối API thực)

## 8. Module Ứng Viên (Candidate Portal - Role: CANDIDATE)
- [x] **Hồ Sơ Ứng Viên (Profile)** (HOÀN TẤT)
  - [x] Chỉnh sửa cá nhân (Headline, Summary, Nhập kỹ năng, Kinh nghiệm)
  - [x] Cập nhật Ảnh đại diện (Avatar), Ảnh bìa (Banner Url)
  - [x] Upload CV mặc định (Tích hợp luồng upload lên Cloud và lưu URL)
- [x] **Tìm Kiếm Việc Làm (Job Board)** (HOÀN TẤT)
  - [x] Trang chủ: Hiển thị danh sách Việc làm Public (Thanh tìm kiếm, Bộ lọc)
  - [x] Trang chi tiết việc làm (Job Detail)
- [x] **Ứng Tuyển & Theo Dõi (Application Tracking)** (HOÀN TẤT)
  - [x] Chức năng Nộp đơn (Apply) kèm CV (Chọn CV cũ hoặc Upload mới) và Cover Letter
  - [x] Trang "Việc làm của tôi": Quản lý các đơn ứng tuyển và xem trạng thái (`/applications/mine`)
  - [x] Xem thông tin Lịch phỏng vấn (`GET /interviews/{id}`)
  - [x] Xem nội dung Offer và Phản hồi (ACCEPT/DECLINE) - API: `PUT /offers/{id}/respond`

## 9. Module Quản Trị Hệ Thống (System Admin - Role: SYSTEM_ADMIN / CUSTOMER_SERVICE) (HOÀN TẤT)
- [x] **Quản trị người dùng & Công ty** (Đã có `Admin Mock Service`)
  - [x] Xem danh sách các công ty tham gia hệ thống
  - [x] Quản lý, Khóa/Mở Khóa Account người dùng
- [x] **Lịch sử Giao dịch (Transactions)** (Đã có `Admin Mock Service`)
  - [x] Bảng theo dõi toàn bộ lịch sử thanh toán từ PayOS (`TRANSACTION:VIEW_ALL`)
- [x] **Roles & Permissions (RBAC)** (Đã tích hợp JWT Payload Decode)
  - [x] Logic Route Guards: Hiển thị Sidebar / Menu động và tự động chặn các route dựa theo bộ quyền (Permissions) và Roles của user hiện tại.
