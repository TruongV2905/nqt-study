# NQT Vocabulary — handoff

## Trạng thái triển khai

Đã triển khai các route `/`, `/vocabulary`, `/learn`, `/quiz`, `/review`, `/statistics`, `/settings`, `/admin` theo kiến trúc V3. `/admin/login` đã được xóa theo yêu cầu quản trị không xác thực. UI dùng tiếng Việt, nhận diện NQT lavender, sidebar desktop/drawer mobile và các trạng thái config/loading/error/empty.

Data path: React page → hook React Query → service → singleton Supabase typed client. Không có sample curriculum trong production. Supabase Auth chỉ tạo anonymous session nền; không có email/OTP quản trị hay kiểm tra `app_admins` trong UI.

Quiz hỗ trợ MCQ bốn nghĩa khác nhau và fill từ cặp `[]`; chuẩn hóa NFKC/trim/lowercase/khoảng trắng; snapshot câu hỏi; deadline timestamp; guard lưu kết quả một lần; progress dùng RPC nguyên tử. Session tạm được ghi vào `sessionStorage` để làm nền cho resume, nhưng UI hiện chưa tự khôi phục phiên quiz sau refresh.

## Kết quả kiểm tra ngày 2026-11-06

```text
npm test             PASS — 4/4 quiz-engine tests
npx tsc --noEmit     PASS — strict + noUncheckedIndexedAccess
npx eslint src       PASS — 0 error, 0 warning
```

- **Sửa lỗi runtime**: Đã khắc phục dứt điểm lỗi vi phạm check constraint `study_sessions_question_type_check` (và `user_settings_default_question_type_check`): trong schema PostgreSQL, cột `question_type` có ràng buộc `NOT NULL` và check constraint chỉ chấp nhận `('mcq', 'fill', 'both')`. Đã thêm mapper chuẩn hóa `toDbQuestionType` và `toDbSettingsQuestionType` tự động ánh xạ từ UI (`'multiple_choice'` → `'mcq'`, `'mixed'` / `'flashcard'` → `'both'`, `'fill'` → `'fill'`) trước khi ghi vào Supabase, đồng thời decode ngược lại khi đọc cấu hình. Dùng `mutate` bọc an toàn tránh unhandled rejection.
- **Tính năng loại từ (Part of Speech)**: Tại form thêm/sửa từ vựng (`vocabulary-form-dialog.tsx`), trường loại từ đã được chuyển thành thanh `select` chứa các loại từ chuẩn, đồng thời hỗ trợ tùy chọn "Khác (Tự nhập tay)..." để tự do nhập loại từ tùy chỉnh khi cần.

Build manifest xác nhận đủ các route học và `/admin`.

Dev server trả HTTP 200 cho các route và HTML có metadata `NQT Vocabulary`. Phiên làm việc không có browser được kết nối nên chưa thể chụp ảnh/đo overflow trực tiếp ở 390/768/1440px; CSS đã có breakpoint 1100/770/520px, drawer mobile và bảng cuộn ngang.

## Việc cần làm với môi trường thật

1. Áp dụng migration rồi chạy hai-client RLS test theo README.
2. Generate lại `src/types/database.types.ts` bằng Supabase CLI từ project thật. Repo không có project ref/credentials nên file hiện tại là generated-compatible shape từ schema trong spec, không phải output CLI của một project đã kết nối.
3. Xác minh email recovery giữ nguyên UID trước/sau khi đăng nhập trên trình duyệt khác.
4. Nếu cần resume quiz hoàn chỉnh, đọc snapshot `nqt-active-quiz` khi mount, validate bằng Zod và yêu cầu người học xác nhận tiếp tục.

## Cây nguồn chính

```text
src/
├── app/                 # layout, route wrappers, _components, _providers
├── features/            # chỉ các *-page.tsx hoàn chỉnh
├── components/ui/       # primitives
├── hooks/               # React Query và stateful hooks
├── services/            # Supabase/Auth IO
├── schemas/             # Zod
├── types/               # database/domain types
├── utils/               # quiz, review, date, TTS
└── lib/                 # Supabase client, QueryClient, cn
supabase/migrations/
├── 20261106000100_nqt_admin_permissions.sql
└── 20261106000200_open_content_management.sql
```

Các thư mục `components/` và `lib/` ở root là scaffold shadcn chưa tracked có sẵn trước lần triển khai này; code runtime NQT chỉ import từ `src/components` và `src/lib` qua alias `@/* -> ./src/*`.
