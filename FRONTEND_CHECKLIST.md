# Frontend Implementation Checklist - VietRecruit

Dựa trên phân tích tài liệu API, Database schemas và source code Frontend hiện tại, dưới đây là danh sách các tính năng cần được tiếp tục triển khai ở phía Frontend.

## 1. Module Công ty & Gói cước (Company & Subscription - Role: COMPANY_ADMIN)
- [ ] **Quản lý Hồ sơ Công ty**
  - [ ] Trang cập nhật thông tin công ty (Tên, Domain, Website, Ngành nghề)
  - [ ] Thêm / Sửa / Xóa Phòng ban (Departments)
  - [ ] Thêm / Sửa / Xóa Địa điểm làm việc (Locations)
- [ ] **Gói cước & Thanh toán**
  - [ ] Trang danh sách bảng giá / gói cước (Hiển thị list từ API)
  - [ ] Tích hợp luồng checkout thanh toán qua PayOS
  - [ ] Trang trạng thái giao dịch (Thành công / Thất bại) sau khi redirect từ PayOS về
  - [ ] Quản lý Quota (Số lượng bài đăng còn lại, chu kỳ gói cước)

## 2. Module Quản lý Tuyển dụng (Job Management - Role: HR/COMPANY_ADMIN)
- [ ] **Danh sách Công việc (Job List)**
  - [ ] Trang danh sách Job nội bộ (kèm trạng thái DRAFT, PUBLISHED, CLOSED)
- [ ] **Tạo / Chỉnh sửa Công việc**
  - [ ] Form tạo Job mới (Lưu nháp - DRAFT)
  - [ ] Chức năng Publish Job (Kiểm tra xem còn Quota không)
  - [ ] Chức năng Close Job

## 3. Module Đường ống & Phỏng vấn (Pipeline & Interview - Role: HR/INTERVIEWER)
- [ ] **Quản lý Ứng viên (Kanban Pipeline - Đã có sườn)**
  - [ ] Cập nhật gọi API thật lấy danh sách Ứng viên đang nộp vào Job cụ thể
  - [ ] Kéo thả cập nhật trạng thái Application (NEW -> SCREENING -> INTERVIEW -> OFFER -> HIRED)
- [ ] **Lịch Phỏng vấn (Interviews)**
  - [ ] Dialog tạo/lên lịch phỏng vấn (Chọn Interviewer, thời gian, link meet/địa điểm)
  - [ ] Cập nhật trạng thái Phỏng vấn (COMPLETED, CANCELED)
- [ ] **Đánh giá (Scorecard)**
  - [ ] Form điền điểm đánh giá sau phỏng vấn (Skill, Attitude, English, Note, Result)
  - [ ] Hiển thị tổng hợp điểm đánh giá cho HR quyết định
- [ ] **Quản lý Offer**
  - [ ] Form tạo Offer (Lương cơ bản, Ngày bắt đầu làm việc, Link JD/Offer letter)
  - [ ] Hành động gửi (Send) Offer cho ứng viên

## 4. Module Ứng viên (Candidate - Role: CANDIDATE)
- [ ] **Hồ sơ cá nhân (Candidate Profile)**
  - [ ] Cập nhật Bio, Kỹ năng, Kinh nghiệm làm việc
  - [ ] Tải lên (Upload) CV mặc định (PDF/DOCX)
  - [ ] Upload Avatar / Banner cá nhân
- [ ] **Cổng thông tin Việc làm (Job Portal)**
  - [ ] Trang chủ: Hiển thị danh sách việc làm đang Publish (Tìm kiếm, Lọc theo category, location)
  - [ ] Trang chi tiết việc làm (Job Detail)
- [ ] **Quá trình ứng tuyển**
  - [ ] Chức năng Nộp đơn (Apply) kèm CV và Cover Letter
  - [ ] Trang lịch sử ứng tuyển (Xem trạng thái CV của mình đến vòng nào)
  - [ ] Chức năng Phản hồi Offer (Chấp nhận / Từ chối)

## 5. Các tính năng hệ thống khác (System / Admin)
- [ ] Danh sách nhân viên (Mời HR / Interviewer vào trong workspace công ty)
- [ ] Lịch sử giao dịch (Cho Admin kiểm tra toàn bộ thanh toán PayOS)
- [ ] Phân quyền Sidebar/Menu động theo Role cục bộ (Role-Based Access Control)
