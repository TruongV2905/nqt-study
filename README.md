# NQT Vocabulary

Ứng dụng học từ vựng tiếng Anh cho người Việt, xây bằng Next.js 16 App Router, TypeScript và Supabase. Người dùng không cần đăng nhập; ứng dụng tự tạo phiên Anonymous Auth trong nền để lưu tiến độ. Trang `/admin` được mở trực tiếp, không có email/OTP quản trị.

## 1. Chuẩn bị Supabase

Project của bạn phải có sẵn 6 bảng: `study_days`, `vocabularies`, `vocabulary_days`, `word_progress`, `study_sessions`, `user_settings`. **Không chạy SQL tạo lại hoặc xóa 6 bảng này.**

1. Mở Supabase Dashboard → Authentication → Providers.
2. Bật **Allow anonymous sign-ins**.
3. Email Auth chỉ cần bật nếu muốn dùng tính năng liên kết email khôi phục trong Settings; nó không được dùng để bảo vệ `/admin`.
4. Trong Authentication → URL Configuration, đặt Site URL khi chạy local là `http://localhost:3000` và thêm redirect URL cho local/Vercel.
5. Mở SQL Editor, xem policy hiện tại bằng:

```sql
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

6. Chạy [`20261106000100_nqt_admin_permissions.sql`](supabase/migrations/20261106000100_nqt_admin_permissions.sql). Nếu bạn từng chạy phiên bản cũ có kiểm tra `app_admins`, chạy thêm [`20261106000200_open_content_management.sql`](supabase/migrations/20261106000200_open_content_management.sql) để chuyển policy hiện có sang quản trị mở.

Nếu đã dùng migration admin từ một dự án cũ, kiểm tra schema/policy/FK trước. Migration NQT chủ động xóa policy trên 7 bảng app để tránh policy permissive cũ ghép `OR` và làm rò quyền.

## 2. Cấu hình môi trường

Trong Supabase Dashboard → Project Settings → API, lấy Project URL và Publishable Key (`sb_publishable_...`), không phải secret/service-role key.

Sao chép `.env.example` thành `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

Không đưa database password, secret key hoặc `service_role` vào frontend hay Git.

## 3. Chạy local

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000). Nếu thiếu env, website chỉ hiện hướng dẫn cấu hình; nó không dùng dữ liệu mẫu giả.

Các lệnh kiểm tra:

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

## 4. Trang quản trị không đăng nhập

Mở trực tiếp `/admin` để thêm, sửa và xóa Day/từ vựng. Không có `/admin/login`, không cần email quản trị và không cần chạy bootstrap admin.

**Cảnh báo:** mọi người truy cập website đều có thể mở `/admin` và sửa toàn bộ nội dung chung. Cấu hình này chỉ phù hợp cho website cá nhân, môi trường tin cậy hoặc bản chạy nội bộ. Trước khi public website, nên khôi phục lớp xác thực quản trị.

## 5. Quy trình sử dụng

1. Admin vào `/admin`, tạo Day với số thứ tự, tiêu đề và ngày học tùy chọn.
2. Admin tạo từ, nhập nghĩa, phiên âm, loại từ, các câu ví dụ và chọn nhiều Day.
3. Với câu điền từ, đặt đáp án trong ngoặc vuông, ví dụ: `The room can [accommodate] fifty people.`
4. Người học mở `/vocabulary`, `/learn` hoặc `/quiz`. Không chọn Day nghĩa là dùng tất cả Day; từ thuộc nhiều Day vẫn chỉ xuất hiện một lần.
5. `/review` lấy từ sai/đến lịch ôn. `/statistics` chỉ tính từ `study_sessions` đã lưu.
6. `/settings` cho phép cấu hình giờ/thời lượng, xuất/nhập JSON và liên kết email khôi phục.

Anonymous UID chưa liên kết email sẽ không có đường khôi phục nếu người dùng xóa toàn bộ storage trình duyệt. Liên kết email tại Settings và xác minh trước khi cần khôi phục.

## 6. Kiểm tra RLS bắt buộc

Dùng hai phiên trình duyệt/UID khác nhau:

- Mọi phiên anonymous đọc và CRUD được `study_days`, `vocabularies`, `vocabulary_days` theo cấu hình quản trị mở.
- Learner A không đọc/sửa được `word_progress`, `study_sessions`, `user_settings` của Learner B.
- Thao tác quiz cập nhật progress qua `apply_word_progress`; kết thúc bài chỉ insert một `study_sessions`.

Các kiểm tra này cần project Supabase thật và không thể được chứng minh chỉ bằng build frontend.

## 7. Generate lại TypeScript types

Sau khi áp dụng migration, generate types trực tiếp từ project thật:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF --schema public > src/types/database.types.ts
```

File đang commit có đúng shape của schema được đặc tả để project build trước khi có project ref. Khi schema Supabase thật khác (default/nullability/constraint), output CLI là nguồn chuẩn và cần được commit thay thế.

## 8. Deploy Vercel

1. Push repository lên GitHub và import project vào Vercel.
2. Thêm hai biến `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ở Vercel Project Settings.
3. Deploy.
4. Thêm domain Vercel vào Supabase Authentication → URL Configuration → Redirect URLs; đổi Site URL sang domain production khi phù hợp.
5. Không cấu hình secret/service-role key trên frontend.

## Kiến trúc

- `src/app/**/page.tsx`: route wrapper mỏng.
- `src/features/**/**-page.tsx`: màn hình hoàn chỉnh.
- `src/app/**/_components`: UI dùng riêng/shared cho route.
- `src/services`, `src/hooks`, `src/schemas`, `src/utils`, `src/types`: các lớp ngang hàng với `src/app`.
- `src/components/ui`: UI primitives.
- `supabase/migrations`: bảo mật, RLS và RPC PostgreSQL.

Không có API route/backend riêng; browser dùng Supabase JS SDK. RLS vẫn cô lập dữ liệu học cá nhân, nhưng curriculum được cố ý mở quyền ghi theo yêu cầu quản trị không đăng nhập.
