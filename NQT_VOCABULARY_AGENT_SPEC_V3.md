# NQT VOCABULARY — MASTER SPEC V3.0 (2026-11-06)

> **BẢN CẬP NHẬT V3 — thay thế V2 và WordNest cũ.** Kiến trúc BẮT BUỘC do người dùng xác định: `src/app/` chỉ định nghĩa route (`page.tsx` gọi page hoàn chỉnh), `src/features/` chứa **DUY NHẤT các màn hình/page hoàn chỉnh**, UI component tách riêng trong **Next.js Private Folders `_components/` dưới `app/`**, còn `src/schemas/`, `src/services/`, `src/types/`, `src/hooks/`, `src/utils/` đều **ngang cấp với `src/app/` và `src/features/`**. Không lồng service/hook/schema/component trong `features/`. Thương hiệu `NQT`.

> **Mục tiêu:** Xây dựng lại website **NQT Vocabulary** — website học từ vựng tiếng Anh cho người Việt — với **giao diện gần như giống hệt bản `wordnest-nextjs-supabase.zip` đã có**, nhưng tổ chức mã nguồn theo kiến trúc **Next.js App Router + TypeScript** rõ ràng, dễ bảo trì. Có kết nối **Supabase PostgreSQL thực tế**, **không tự viết Backend**. Người học không có màn hình đăng nhập; **CHỈ ADMIN được CRUD NGÀY HỌC VÀ TỪ VỰNG**. Website deploy trên Vercel.
>
> **Agent: HÃY TRIỂN KHAI MÃ NGUỒN, KHÔNG CHỈ ĐƯA RA KẾ HOẠCH.** Nếu repo Next.js đã có sẵn, hãy đọc cấu trúc, quy tắc, dependency và tái sử dụng cấu trúc đó trước khi thêm code. Đừng tự ý thay toàn bộ tổ chức repo của người dùng. Nếu có đính kèm `wordnest-nextjs-supabase.zip`, hãy đọc nó như **visual/UX reference**, thay toàn bộ chữ/logo WordNest bằng NQT; **không copy nguyên cấu trúc cũ** hoặc giữ những điểm yếu của bản demo. Trong trường hợp không có ZIP, các yêu cầu trong tài liệu này đủ để triển khai.

---

## 0. Điều kiện nghiệm thu quan trọng nhất

1. `npm install`, cấu hình `.env.local`, `npm run dev` → chạy được. `npm run build` + `npx tsc --noEmit` không lỗi.
2. Các trang công khai: Dashboard, Thư viện từ vựng, Học, Kiểm tra, Ôn từ sai, Thống kê, Cài đặt. Có `/admin` và `/admin/login` riêng.
3. Chỉ **tài khoản admin được cấp quyền trên Supabase** mới tạo/sửa/xóa `study_days`, `vocabularies`, `vocabulary_days`. Người học chỉ xem nội dung và ghi **tiến độ cá nhân, lịch sử làm bài, cài đặt cá nhân**.
4. **Không dùng hardcoded sample làm dữ liệu chính.** Khi cấu hình Supabase, tất cả Day/từ hiển thị phải lấy từ database thật. Database rỗng → empty state đúng; tuyệt đối không lén hiển thị 10 từ mẫu giả rồi báo “Cloud Sync”. Có thể cung cấp script seed dữ liệu mẫu **tùy chọn**, KHÔNG tự chạy.
5. Trắc nghiệm: từ tiếng Anh → 4 nghĩa tiếng Việt **khác nhau**, 1 đáp án đúng. Điền từ: nội dung trong `[ ]` là đáp án, người học nhập vào chỗ trống.
6. Học/kiểm tra theo Day hoặc gộp Day bất kỳ, không đếm trùng từ. Đặt thời lượng không giới hạn / 5 / 10 / 15 / 20 / 30 / 45 / 60 phút. Bài kiểm tra tự nộp khi hết giờ và lưu kết quả một lần.
7. Trạng thái lưu dữ liệu rõ ràng: `Đang đồng bộ` / `Đã lưu lên cloud` / `Lỗi đồng bộ`; không báo đã lưu nếu Supabase thực tế lỗi.
8. Giữ **ngôn ngữ UI tiếng Việt**, thương hiệu **NQT Vocabulary**, tone màu **tím lavender + nền trắng/xám sáng**, hình thức trang giống ZIP tham khảo.
9. Hỗ trợ mobile: sidebar drawer, card responsive, quiz dễ dùng bằng bàn phím và cảm ứng.
10. Có README hướng dẫn Supabase, SQL migration, tạo admin, chạy localhost và deploy Vercel; không yêu cầu server riêng.
11. **Kiến trúc V3 bắt buộc:** `src/features/` chỉ chứa các React page hoàn chỉnh (mỗi page kết xuất nội dung một route); `src/app/**/page.tsx` là wrapper mỏng chỉ import/render page tương ứng; các `_components/` nằm trong `src/app/`; `src/schemas/`, `src/services/`, `src/types/`, `src/hooks/`, `src/utils/` là các thư mục ngang cấp với `src/app/`. Không đặt hooks/services/schemas/utils/components trong `features/`.
12. **Brand NQT:** logo chữ NQT, page title `NQT Vocabulary`, metadata/favicons/copy thống nhất, màu và UX vẫn giữ gần sát ZIP WordNest tham chiếu.

---

## 1. Tech stack & các ràng buộc

| Hạng mục | Công nghệ / quyết định |
|---|---|
| App | Next.js App Router, React, TypeScript, cấu trúc `src/` |
| Styling | Tailwind CSS + `shadcn/ui`, CSS variables cho brand |
| Icons | `lucide-react` |
| State UI | hooks/custom hooks; có thể dùng Zustand nếu giúp giảm prop drilling |
| Query/cache | TanStack Query là lựa chọn ưu tiên cho Supabase reads/mutations/invalidation |
| Backend as a Service | Supabase PostgreSQL + Supabase Auth + JS SDK |
| Deploy | Vercel; không viết Express/Nest/Spring/FastAPI |
| Authentication | Anonymous Supabase Auth trong nền cho người học, OTP email riêng cho admin |
| Authorization | PostgreSQL Row Level Security (RLS) + bảng `app_admins` |
| Validation | Zod + React Hook Form ở các form CRUD |
| Notifications | shadcn Sonner toast |
| TTS | Web Speech API, `speechSynthesis`, ưu tiên giọng `en-US` có sẵn |
| Chart | Recharts hoặc chart component shadcn khi cần |

**Cấm:** service role key / secret key trong browser; gọi Supabase từ client với quyền vượt RLS; nút CRUD chỉ được ẩn bằng điều kiện UI mà database vẫn cho sửa; sử dụng localStorage làm nguồn sự thật thay Supabase; thao tác ghi giả không được báo lỗi; cần người dùng đăng nhập để vào trang học.

**Cài đặt shadcn/ui (nếu repo chưa có):**

```bash
npx shadcn@latest init
npx shadcn@latest add button input label card dialog alert-dialog select checkbox radio-group tabs badge table form textarea dropdown-menu popover progress separator skeleton sonner tooltip sheet scroll-area
npm install @supabase/supabase-js lucide-react @tanstack/react-query zod react-hook-form @hookform/resolvers
```

Chỉ dùng package thực sự cần. Nếu repo đang có version/formatter/convention khác, ưu tiên tương thích repo.

---

## 2. Thiết kế hình ảnh: PHẢI GIỐNG WordNest cũ (ZIP tham chiếu)

### 2.1. Visual identity

- **Tên thương hiệu (bắt buộc):** `NQT`; tên website `NQT Vocabulary`; tagline `Vocabulary Studio` (hoặc `Không gian học từ vựng`). Không còn dùng tên `WordNest` trong giao diện, tiêu đề trình duyệt, favicon, email hay README mới. Chỉ được nhắc `wordnest-nextjs-supabase.zip` là *source tham chiếu* khi cần.
- **Font:** `DM Sans` cho body, `Plus Jakarta Sans` cho heading và số liệu lớn (Google Fonts hoặc `next/font`).
- **Nền toàn trang:** `#F7F8FC` hoặc rất gần; sidebar/topbar/card trắng `#FFFFFF`.
- **Chữ chính:** `#1D2940`; chữ phụ: `#79869A`; border sáng: `#E8EAF2`.
- **Tím chủ đạo:** `#6E52DC` hoặc `#7656DF`; hover lavender, active `#F0ECFF`.
- **Thành công:** xanh `#26A788`; lỗi: `#E76775`.
- **Hero dashboard:** gradient `linear-gradient(115deg, #6C4BD1 0%, #8A66E7 60%, #A885F6 100%)`.
- **Card:** nền trắng, border mảnh, bo góc khoảng 16px, shadow rất nhẹ. Buttons bo góc 10–12px; hero bo 20px.
- **Tone:** dashboard học tập hiện đại, thân thiện, nhiều khoảng trắng; **không** đổi thành dark theme, neon, gradient toàn trang, glassmorphism hoặc landing page bán hàng.
- **Icons:** Lucide stroke icons (BookOpen, LayoutDashboard, Layers, GraduationCap, ClipboardList, BrainCircuit, ChartNoAxesColumn, Settings, ShieldCheck, Volume2, CalendarDays...).

### 2.2. App shell

**Desktop >= 1100px**:

```text
┌───────────────────────┬────────────────────────────────────────────────────────┐
│ [N] NQT                 │  Không gian học của bạn ✦             [Cloud Sync]     │
│     Vocabulary Studio  ├────────────────────────────────────────────────────────┤
│                       │                                                        │
│ HỌC TẬP               │  [EYEBROW]                                             │
│  ▣ Tổng quan          │  Tên trang lớn                                         │
│  ▣ Từ vựng theo ngày  │  Mô tả ngắn                                             │
│  ▣ Học từ vựng        │                                                        │
│  ▣ Kiểm tra           │  Nội dung: hero / stats / card / table / quiz...       │
│  ▣ Ôn tập từ sai      │                                                        │
│  ▣ Thống kê           │                                                        │
│  ▣ Cài đặt            │                                                        │
│                       │                                                        │
│ QUẢN TRỊ              │                                                        │
│  ▣ Quản trị nội dung  │                                                        │
│                       │                                                        │
│ [cloud] Supabase      │                                                        │
└───────────────────────┴────────────────────────────────────────────────────────┘
```

- Sidebar cố định rộng **260px**, nền trắng, border-right mảnh. Logo tím icon sách trong hình vuông bo 13px.
- Item nav padding ~13px, icon 19px, active lavender `#F0ECFF`, text tím đậm.
- Dưới sidebar có mục `QUẢN TRỊ` và thông tin trạng thái lưu trữ.
- Topbar cao ~76px, nền trắng, chữ `Không gian học của bạn ✦` và badge `Cloud Sync` **chỉ khi thực sự cấu hình + kết nối được**.
- Nội dung max-width ~1350px, padding desktop ~40px; header có eyebrow chữ in hoa tím nhạt, tiêu đề đậm 25–34px và mô tả.
- Mobile <= 770px: sidebar chuyển thành **Sheet/Drawer** mở bằng hamburger; overlay khi mở; không bị tràn ngang. Grid 3→2→1 cột, bảng admin có horizontal scroll.

### 2.3. Trang chủ `/`

- Heading: **“Học mỗi ngày, nhớ thật lâu.”**. Mô tả: “Tổ chức từ vựng, ôn tập thông minh và theo dõi sự tiến bộ của bạn.”
- Hero gradient tím, bên trái có eyebrow `GÓC HỌC TẬP CỦA BẠN`, tiêu đề hai dòng **“Một từ mới hôm nay, một bước tiến ngày mai.”**, đoạn mô tả ngắn và hai nút `Bắt đầu học`, `Làm bài kiểm tra`. Bên phải là vòng tròn biểu tượng quyển sách với các quầng tròn/dot trang trí, **không cần ảnh AI**.
- 4 stat cards nằm một hàng desktop: `Từ vựng`, `Ngày học`, `Tỷ lệ trả lời đúng`, `Buổi đã lưu`.
- Section **“Hành trình học tập”** hiển thị Day cards grid 3 cột: nhãn `BỘ TỪ VỰNG`, số `01` màu tím pastel size ~38px, tiêu đề Day 1, description, số từ, mũi tên.
- Section **“Một vài từ dành cho bạn”** gồm 3 thẻ WordCard có từ tiếng Anh, phát âm, nghĩa, thẻ Day, ví dụ, nút nghe phát âm.
- Nếu database trống, giữ bố cục nhưng hiển thị empty state + hướng dẫn vào `/admin` để thêm nội dung (không hiển thị data giả).

### 2.4. Trang `/vocabulary`

- Eyebrow `THƯ VIỆN`, title `Kho từ vựng`, mô tả `Duyệt từ vựng theo ngày học hoặc tìm kiếm nhanh.`
- Thanh tìm kiếm từ Anh/Việt + Select lọc `Tất cả ngày học` / từng Day; ghi `Tìm thấy N từ vựng`.
- WordCard grid 3 cột desktop, 2 tablet, 1 mobile; card có `word`, IPA/part of speech, nút âm thanh, nghĩa Việt, badge Day và câu ví dụ không có dấu `[]`.
- Click/nút phát âm không điều hướng, có thể chọn US voice, fallback nếu browser không hỗ trợ.

### 2.5. Trang `/learn`

- Title `Học từ vựng`; phần setup trong panel max-width ~730px.
- Bộ chọn Day dạng **day-chip grid**: chọn nhiều ngày, click để toggle, state selected hiển thị border/background tím. Không chọn Day nào = tất cả Day. Có số từ đã chọn, nút chọn tất cả và bỏ chọn.
- Dropdown thời lượng: `Không giới hạn`, 5, 10, 15, 20, 30, 45, 60 phút; CTA `Bắt đầu học`.
- Khi bắt đầu: header `Thẻ 1 / N`, timer cạnh phải, thanh progress mảnh.
- Flashcard trắng lớn bo ~21px, ở giữa có eyebrow `TỪ VỰNG`, từ tiếng Anh lớn, IPA, nút `Volume2`; click `Hiện nghĩa` → hiện nghĩa Việt + ví dụ, sau đó `Trước` / `Tiếp theo` / `Hoàn thành`.
- Hết giờ: lưu 1 study_session `timed_out`, hiển thị trạng thái kết thúc; có tùy chọn học lại.

### 2.6. Trang `/quiz`

- Trước khi kiểm tra: chọn Day bất kỳ (gộp), loại câu hỏi `Cả 2 dạng`, `Trắc nghiệm 4 đáp án`, `Điền vào chỗ trống`; chọn thời lượng; hiển thị tổng số câu tạo được và nút `Bắt đầu kiểm tra`.
- Khi làm bài: `Câu 1/N`, timer `mm:ss`, progress bar, question card lớn trắng ở giữa.
- **Multiple Choice:** từ tiếng Anh lớn; 4 lựa chọn A/B/C/D, desktop grid 2 cột, mobile 1 cột. Một đáp án được highlight tím khi chọn, green khi đúng, red khi sai; feedback + đáp án đúng.
- **Fill:** hiển thị câu ví dụ có `________` thay cho `[đáp án]`, ô Input; không để lộ đáp án chưa nộp; feedback khi chấm.
- Có nút `Kiểm tra` → `Câu tiếp theo`. Không cộng điểm nhiều lần khi double click; khi hết câu hoặc hết thời gian tự tổng kết.
- Result screen: phần trăm, số câu đúng/tổng, câu sai, thời gian thực tế, nút `Làm lại` / `Về trang chủ` / `Ôn từ sai`.

### 2.7. `/review`, `/statistics`, `/settings`

- `/review`: ưu tiên từ có `incorrect_count > 0` và/hoặc `next_review_at <= now()`; danh sách từ thường sai, thẻ từ + nút phát âm; hành động bắt đầu ôn tập dựa trên tập này, không chỉ trang tĩnh.
- `/statistics`: thẻ tổng điểm/lượt học/tỷ lệ đúng; bảng lịch sử các buổi `learn`/`test`, Day đã chọn, thời điểm, số câu đúng, số câu, thời lượng, trạng thái (`completed`/`timed_out`). Có empty state.
- `/settings`: lựa chọn thời lượng mặc định, chế độ câu hỏi, giờ học/ngày và giờ kiểm tra/ngày (time picker). Ghi rõ giờ này là **cấu hình/nhắc trong website**, không hứa tự thông báo khi website đã đóng. Có sync status, export JSON, import JSON an toàn, liên kết email để khôi phục, khu vực hướng dẫn dữ liệu và quyền riêng tư.

### 2.8. `/admin` — chỉ dành cho CRUD nội dung

- Title `Quản trị nội dung`. Tab `Quản lý ngày học` và `Quản lý từ vựng`, bảng dữ liệu trắng, thanh tìm kiếm, nút thêm màu tím.
- **Day CRUD:** số Day (số nguyên > 0, unique), tiêu đề, ngày học thực tế (`study_date`); tạo mới / sửa / xác nhận xóa.
- **Vocabulary CRUD:** word bắt buộc, nghĩa tiếng Việt bắt buộc, IPA, loại từ, nhiều câu ví dụ, chọn **nhiều Day**. Có add/remove ví dụ, nhắc cú pháp `The new policies fail to [accommodate] the disabled.`; ít nhất 1 ví dụ hợp lệ để làm fill.
- Dialog cho add/edit, AlertDialog xác nhận xóa, Sonner toast. Sau mutation refresh/invalidate cache.
- Nếu chưa đủ quyền: **không hiển thị form admin**, hiển thị `Bạn không có quyền quản trị` kèm link `/admin/login`.
- **CHỈ ADMIN được CRUD curriculum.** Mọi người khác được xem từ vựng và học/quiz. Không được đặt create/edit/delete curriculum ở `/vocabulary`, `/learn`, `/quiz`.
- `/admin/login`: email → gửi OTP → nhập 6 chữ số → verify → check `app_admins`. Có xử lý email không hợp lệ, mã sai, hết hạn, retry, logout. Việc người khác tự xác minh email không tự cấp quyền admin.

---

## 3. Business rules cần triển khai đúng

### 3.1. Một từ thuộc nhiều ngày

- `study_days` là Day 1/Day 2/Day 3/... gắn ngày học tùy chọn.
- `vocabularies` chứa một bản ghi từ, `vocabulary_days` là join table nhiều-nhiều.
- Gộp Day 1 + 3 + 5 → UNION từ theo `vocabulary_id`, không nhân đôi câu hỏi vì từ xuất hiện ở nhiều Day.
- Không có Day nào được chọn = chọn tất cả; khi dùng Day cụ thể, chỉ lấy các word có relation với Day đó.
- Xóa Day không xóa word; xóa quan hệ trong `vocabulary_days`. Xóa word cần confirm vì xóa cả progress liên quan nếu FK cascade.

### 3.2. Quiz engine thuần TypeScript, có unit test

`Multiple Choice`:

1. Lấy một `word` làm prompt.
2. Đáp án đúng = `meaning_vi`.
3. Lấy 3 nghĩa **khác nhau** từ các từ **khác** trong danh sách từ đã chọn, shuffle Fisher–Yates.
4. Chỉ tạo MCQ nếu có ít nhất 4 nghĩa khác nhau. Thiếu distractors → hiện cảnh báo rõ ràng, không tự dựng đáp án sai giả, không có lựa chọn trùng.
5. Đối chiếu theo ID/canonical value ổn định, không phụ thuộc thứ tự các options.

`Fill in the Blank`:

1. Từ mỗi `example` tìm **một hoặc nhiều** cặp `[...]`; mức tối thiểu hỗ trợ cặp đầu tiên, và validation thông báo khi nhiều đáp án trong một câu chưa được hỗ trợ.
2. Đáp án = chuỗi nằm trong ngoặc; câu hỏi hiển thị thay phần đó bằng `________`.
3. So sánh `trim`, Unicode NFKC, lowercase và chuẩn hóa khoảng trắng. Không xóa ký tự có nghĩa tùy tiện; cho phép admin tùy chọn nhiều đáp án chấp nhận nếu cấu trúc được mở rộng.
4. Nếu ví dụ thiếu `[...]`, hiển thị ở thẻ từ nhưng **không sinh** fill-question; admin form cảnh báo điều này.

`Test lifecycle`:

- `setup → in_progress → feedback → completed/timed_out`.
- Tạo danh sách câu **1 lần ở đầu buổi** (snapshot), không random lại mỗi render.
- Đồng hồ tính từ `deadline = Date.now() + durationMs`, lấy chênh lệch theo timestamp (không chỉ trừ state mỗi 1s); chuyển tab/refresh không làm kéo dài giờ.
- Có chiến lược persist phiên quiz tạm vào sessionStorage/IndexedDB nếu có thể, để refresh có thể resume; cloud chỉ lưu kết quả hợp lệ. Nếu không hỗ trợ resume phải cảnh báo trước khi rời trang.
- `finish` phải idempotent: chống double save khi vừa click Hoàn thành vừa timer 0.
- Chỉ ghi progress từng câu một lần; lưu `study_sessions` một lần khi kết thúc. Đếm `correctAnswers <= totalQuestions`.
- Học không cần trả lời câu hỏi: chỉ lưu session, không tự đánh dấu đúng nếu người học chỉ lật flashcard.

### 3.3. Theo dõi ghi nhớ

- Mỗi `word_progress` là tiến độ của **một anonymous/permanent learner UID** đối với một `vocabulary_id` admin tạo.
- Lưu `correct_count`, `incorrect_count`, `mastery_level` 0–5, `last_reviewed_at`, `next_review_at`.
- Quy tắc ôn đơn giản: sai → ôn trong 1 ngày; đúng nhiều lần → lùi lịch theo mức thành thạo (vd 1/3/7/14/30 ngày). Viết thành `src/utils/review-scheduler.ts` để thay đổi dễ dàng.
- Dùng upsert/cơ chế tránh race; nếu cần chính xác khi nhiều tab, dùng Postgres RPC/transaction an toàn, không update mất dữ liệu do read–modify–write từ state cũ.

### 3.4. Lưu và phục hồi dữ liệu

- **Supabase là source of truth**, không phải localStorage.
- Anonymous Auth chạy tự động khi vào web, nên người học không gặp login.
- **Quan trọng:** Anonymous user sẽ KHÔNG khôi phục được tiến độ sau khi xóa toàn bộ storage nếu chưa liên kết identity. Không được quảng cáo rằng bật Supabase là tự khôi phục tất cả.
- Trong Settings, cho phép **tùy chọn liên kết email khôi phục** từ phiên anonymous đang có (theo hướng dẫn Supabase `auth.updateUser({ email })`, email verification); sau khi đã verify, có thể OTP/email sign-in khôi phục cùng UID. Phải test UID trước/sau link và sau khôi phục. Không thêm bắt buộc đăng nhập khi vào web.
- Khi mới cài chưa liên kết email, hiển thị cảnh báo kín đáo: `Chưa bật khôi phục: xóa dữ liệu trình duyệt có thể mất lịch sử học.`
- Không tạo anonymous mới **trước** khi cho người dùng chọn `Khôi phục bằng email` trong trường hợp storage trống (có thể mở modal trước hoặc chuyển phiên một cách cẩn thận); không được nhập nhầm tiến độ lên UID mới.
- Có nút `Xuất JSON` gồm metadata version, export date, days/words đọc để tham khảo, progress, sessions, settings. `Nhập JSON`: validate schema + preview + confirm; **người học chỉ được nhập phần tiến độ/cài đặt của mình**, không thể thêm/sửa từ vựng thông qua import. Nếu cần import curriculum cloud, để riêng trong `/admin` và có RLS.
- Khi offline: không báo `Đã lưu cloud`. Nếu chọn làm local queue, hiển thị `Chờ đồng bộ` và chỉ báo success sau khi server xác nhận.

---

## 4. Supabase: schema hiện có và quyền bắt buộc

### 4.1. Người dùng ĐÃ CÓ 6 bảng

**Không tự drop/recreate hoặc xóa dữ liệu.** Các bảng do người dùng đã tạo trong `public`:

```text
study_days(
  id uuid, user_id uuid, day_number integer,
  title text, study_date date, created_at timestamptz
)

vocabularies(
  id uuid, user_id uuid, word text, meaning_vi text,
  pronunciation text, part_of_speech text,
  examples text[], created_at timestamptz
)

vocabulary_days(
  user_id uuid, day_id uuid, vocabulary_id uuid
)

word_progress(
  user_id uuid, vocabulary_id uuid, correct_count integer,
  incorrect_count integer, mastery_level integer,
  last_reviewed_at timestamptz, next_review_at timestamptz
)

study_sessions(
  id uuid, user_id uuid, mode text, selected_day_ids uuid[],
  question_type text, duration_seconds integer,
  total_questions integer, correct_answers integer,
  status text, started_at timestamptz, ended_at timestamptz
)

user_settings(
  user_id uuid, default_duration_minutes integer,
  default_question_type text, daily_study_time time,
  daily_test_time time, updated_at timestamptz
)
```

Trong schema cũ có policy `manage_own_data` cho cả 6 bảng và FK `word_progress(vocabulary_id, user_id)` tới từ vựng cùng owner. Hai điểm đó không tương thích với mục tiêu **curriculum do admin quản lý, tiến độ thuộc người học**. Hãy tạo migration sửa đúng (xem dưới), không chỉ gọi client API.

### 4.2. Migration quyền admin — yêu cầu Agent sinh file `supabase/migrations/YYYYMMDDHHMMSS_nqt_admin_permissions.sql`

Agent phải kiểm tra schema/trạng thái migration hiện tại trước khi chạy. Migration cần làm những việc sau:

1. `CREATE TABLE IF NOT EXISTS public.app_admins(user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now())`.
2. Bật RLS cho `app_admins`, chỉ cho `authenticated` đọc **row của chính mình**, **không cho browser ghi** danh sách admin.
3. Tạo `public.is_app_admin()` dạng SQL `STABLE SECURITY DEFINER SET search_path = ''`, kiểm tra tồn tại `app_admins.user_id = auth.uid()`; `REVOKE ALL ... FROM PUBLIC`, `GRANT EXECUTE TO authenticated`.
4. Xóa policy quá rộng `manage_own_data` trên `study_days`, `vocabularies`, `vocabulary_days`, thay bằng:
   - `SELECT TO authenticated USING (true)` để anonymous Supabase session đọc bộ từ chung.
   - `INSERT TO authenticated WITH CHECK (is_app_admin() AND user_id = auth.uid())`.
   - `UPDATE TO authenticated USING (is_app_admin() AND user_id = auth.uid()) WITH CHECK (...)`.
   - `DELETE TO authenticated USING (is_app_admin() AND user_id = auth.uid())`.
   - Do **not** tạo wildcard `FOR ALL USING(true)` hay policy ghi cho `anon`.
5. Đối với `word_progress`, bỏ FK tổng hợp ràng buộc learner UID = owner từ (kiểm tra tên constraint trước), thay bằng FK `vocabulary_id REFERENCES public.vocabularies(id) ON DELETE CASCADE`; giữ primary key `(user_id, vocabulary_id)` và RLS chỉ user_id = auth.uid().
6. `study_sessions`, `user_settings`: giữ RLS self-owned, chỉ cho đúng `user_id = auth.uid()` đọc/ghi. Bảng hệ thống không được public writable.
7. Check RLS bật ở **tất cả** bảng app; GRANT tối thiểu cho `authenticated`; tuyệt đối không có `service_role` trong client.
8. Viết SQL bootstrap **chạy riêng sau khi verify email admin** (không hardcode email của người dùng trong repo):

```sql
INSERT INTO public.app_admins (user_id)
SELECT id
FROM auth.users
WHERE email = 'REPLACE_WITH_VERIFIED_ADMIN_EMAIL'
  AND email_confirmed_at IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;
```

9. Quan trọng: RLS policies **permissive kết hợp OR**; kiểm tra và xóa policy cũ gây rò quyền chứ không chỉ thêm policy admin. Viết SQL kiểm tra policy hiện hành qua `pg_policies`.
10. Cần test từ hai client UID: admin CRUD thành công, learner đọc được curriculum nhưng INSERT/UPDATE/DELETE 3 bảng curriculum **đều bị từ chối**; mỗi learner chỉ thấy progress/session/settings của chính mình.

**Nếu đã áp dụng `supabase-admin.sql` từ ZIP cũ:** Không chạy trùng migration hoặc tạo duplicate policy; kiểm tra `app_admins`, `is_app_admin()`, `pg_policies`, FK trước khi thực thi. Migration phải an toàn/idempotent khi phù hợp.

### 4.3. Kết nối Frontend

`.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

- Chỉ một Supabase singleton client trong `src/lib/supabase/client.ts` cho browser. Bật `autoRefreshToken`, `persistSession`, `detectSessionInUrl` theo cách phù hợp SDK hiện hành.
- Nếu thiếu env: hiển thị **Configuration Required** + cách cấu hình; KHÔNG tự rơi vào demo dữ liệu cứng rồi nói là cloud.
- Lấy `auth.getUser()`/`auth.getSession()` phù hợp từng use case, khởi tạo anonymous **một lần** (tránh race khi nhiều React effects chạy). Không vô tình tạo user mới mỗi refresh.
- Có hooks/services ở `src/hooks/` và `src/services/` truy vấn Day, Words, Progress, Sessions, Settings và Admin; cache/invalidation rõ ràng.
- Không `select('*')` tràn lan ở bảng lớn khi danh sách tăng; có pagination khi cần. Bỏ client API gọi thẳng trong JSX UI.
- Hiển thị trạng thái loading/empty/error/retry; bắt và hiển thị lỗi chi tiết dễ hiểu, không im lặng nuốt exception.

---

## 5. KIẾN TRÚC BẮT BUỘC — APP ROUTER MỎNG + FEATURES PAGE + THƯ MỤC NGANG CẤP

> **ĐÂY LÀ QUY TẮC QUAN TRỌNG NHẤT, ƯU TIÊN HƠN MỌI THÓI QUEN CỦA AGENT.** Người dùng muốn một thư mục **`src/features/` nằm NGOÀI `src/app/`**. Thư mục `features/` **chỉ chứa các page/màn hình hoàn chỉnh**, *không* chứa thư mục `components`, `hooks`, `services`, `schemas`, `utils`, hay code truy vấn dữ liệu. `src/app/` chỉ làm router mỏng. Các UI component không thuộc shadcn đặt trong **Private Folders `_components` bên trong `src/app/`**; `schemas`, `services`, `types`, `hooks`, `utils` là **các thư mục trực tiếp dưới `src/`, ngang hàng với `app` và `features`**. Tuyệt đối không quay về feature-sliced structure cũ.

### 5.1. Cây thư mục CHUẨN và duy nhất

```text
nqt-vocabulary/
├── public/
│   └── (NQT assets, icons)
├── src/
│   ├── app/                              # CHỈ route entry, layout, route-local UI
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── icon.svg
│   │   ├── not-found.tsx
│   │   ├── _providers/
│   │   │   └── app-providers.tsx
│   │   ├── _components/                  # Component SHARED cho >= 2 routes
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── app-header.tsx
│   │   │   ├── page-header.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── day-picker.tsx
│   │   │   └── word-card.tsx
│   │   └── (features)/                   # Route group, KHONG xuất hiện trong URL
│   │       ├── layout.tsx               # Shell route; không chứa business logic
│   │       ├── page.tsx                 # /             -> features/dashboard/dashboard-page
│   │       ├── vocabulary/
│   │       │   ├── page.tsx             # /vocabulary   -> features/vocabulary/vocabulary-page
│   │       │   ├── loading.tsx
│   │       │   └── _components/         # CHỈ UI của trang vocabulary
│   │       │       ├── vocabulary-filters.tsx
│   │       │       └── vocabulary-grid.tsx
│   │       ├── learn/
│   │       │   ├── page.tsx             # /learn        -> features/learn/learn-page
│   │       │   └── _components/
│   │       │       ├── learn-setup.tsx
│   │       │       └── flashcard.tsx
│   │       ├── quiz/
│   │       │   ├── page.tsx             # /quiz         -> features/quiz/quiz-page
│   │       │   └── _components/
│   │       │       ├── quiz-setup.tsx
│   │       │       ├── multiple-choice.tsx
│   │       │       ├── fill-in-blank.tsx
│   │       │       └── quiz-result.tsx
│   │       ├── review/
│   │       │   ├── page.tsx             # /review       -> features/review/review-page
│   │       │   └── _components/
│   │       │       └── review-list.tsx
│   │       ├── statistics/
│   │       │   ├── page.tsx             # /statistics   -> features/statistics/statistics-page
│   │       │   └── _components/
│   │       │       └── session-history.tsx
│   │       ├── settings/
│   │       │   ├── page.tsx             # /settings     -> features/settings/settings-page
│   │       │   └── _components/
│   │       │       ├── recovery-settings.tsx
│   │       │       └── backup-settings.tsx
│   │       └── admin/
│   │           ├── page.tsx             # /admin        -> features/admin/admin-page
│   │           ├── _components/
│   │           │   ├── day-crud-table.tsx
│   │           │   ├── vocabulary-crud-table.tsx
│   │           │   ├── day-form-dialog.tsx
│   │           │   └── vocabulary-form-dialog.tsx
│   │           └── login/
│   │               ├── page.tsx         # /admin/login  -> features/admin/admin-login-page
│   │               └── _components/
│   │                   └── otp-form.tsx
│   │
│   ├── features/                         # PAGE HOÀN CHỈNH, KHÔNG logic module rời
│   │   ├── dashboard/
│   │   │   └── dashboard-page.tsx
│   │   ├── vocabulary/
│   │   │   └── vocabulary-page.tsx
│   │   ├── learn/
│   │   │   └── learn-page.tsx
│   │   ├── quiz/
│   │   │   └── quiz-page.tsx
│   │   ├── review/
│   │   │   └── review-page.tsx
│   │   ├── statistics/
│   │   │   └── statistics-page.tsx
│   │   ├── settings/
│   │   │   └── settings-page.tsx
│   │   └── admin/
│   │       ├── admin-page.tsx
│   │       └── admin-login-page.tsx
│   │
│   ├── components/
│   │   └── ui/                           # shadcn/ui primitives; KHÔNG business components
│   │
│   ├── schemas/                          # NGANG HÀNG app; Zod runtime validation
│   │   ├── study-day.schema.ts
│   │   ├── vocabulary.schema.ts
│   │   ├── quiz.schema.ts
│   │   ├── settings.schema.ts
│   │   └── backup.schema.ts
│   │
│   ├── services/                         # NGANG HÀNG app; data-access & nghiệp vụ IO
│   │   ├── auth.service.ts
│   │   ├── admin.service.ts
│   │   ├── study-day.service.ts
│   │   ├── vocabulary.service.ts
│   │   ├── progress.service.ts
│   │   ├── study-session.service.ts
│   │   └── settings.service.ts
│   │
│   ├── hooks/                            # NGANG HÀNG app; React Query & stateful hooks
│   │   ├── use-auth-session.ts
│   │   ├── use-admin-access.ts
│   │   ├── use-study-days.ts
│   │   ├── use-vocabularies.ts
│   │   ├── use-word-progress.ts
│   │   ├── use-study-session.ts
│   │   ├── use-learn-session.ts
│   │   ├── use-quiz-session.ts
│   │   └── use-study-timer.ts
│   │
│   ├── utils/                            # NGANG HÀNG app; pure TS helper, testable
│   │   ├── quiz-engine.ts
│   │   ├── quiz-engine.test.ts
│   │   ├── review-scheduler.ts
│   │   ├── pronunciation.ts
│   │   ├── study-timer.ts
│   │   ├── date-time.ts
│   │   └── backup.ts
│   │
│   ├── types/                            # NGANG HÀNG app; TS type canonical
│   │   ├── database.types.ts            # Generated từ Supabase (KHÔNG viết tay)
│   │   ├── database.ts                  # Row/Insert/Update aliases
│   │   ├── vocabulary.ts
│   │   ├── study-day.ts
│   │   ├── quiz.ts
│   │   ├── progress.ts
│   │   ├── study-session.ts
│   │   ├── auth.ts
│   │   └── common.ts
│   │
│   └── lib/                              # Framework/infrastructure utilities
│       ├── supabase/
│       │   └── client.ts
│       ├── query-client.ts
│       └── utils.ts                    # shadcn cn()
├── supabase/
│   └── migrations/
│       └── YYYYMMDDHHMMSS_nqt_admin_permissions.sql
├── .env.example
├── .gitignore
├── eslint.config.mjs
├── components.json
├── next.config.ts
├── tsconfig.json
├── package.json
├── README.md
└── AGENT_HANDOFF.md
```

**Ghi chú về `_components`:** Dấu `_` có ý nghĩa **Private Folder thực sự đối với Next.js khi nằm trong `src/app`**. Vì vậy các component route-specific được đặt tại `src/app/(features)/<route>/_components/`, component dùng chung tại `src/app/_components/`. **Không** dùng `src/_components` rồi gọi đó là cơ chế private routing của Next.js. Đây là quyết định vị trí component theo yêu cầu người dùng, không phải ranh giới phân quyền bảo mật. Các UI primitive của shadcn/ui vẫn ở `src/components/ui/` vì CLI của shadcn thường quản lý ở đó.

**Không tạo các thư mục `_hooks`, `_services`, `_schemas`, `_utils` bên trong `app/` hoặc `features/`.** Các module này bắt buộc ở `src/hooks`, `src/services`, `src/schemas`, `src/utils` tương ứng. Không để `src/features/vocabulary/{components,hooks,services,schemas,utils}`. Không để root `src/features/page.tsx` vì `features` không tham gia Next.js routing.

### 5.2. `page.tsx` ở `app` CHỈ gọi full page từ `features`

Ví dụ `src/app/(features)/vocabulary/page.tsx`:

```tsx
import { VocabularyPage } from '@/features/vocabulary/vocabulary-page';

export default function Page() {
  return <VocabularyPage />;
}
```

Ví dụ `src/features/vocabulary/vocabulary-page.tsx`:

```tsx
'use client';

import { VocabularyGrid } from '@/app/(features)/vocabulary/_components/vocabulary-grid';
import { VocabularyFilters } from '@/app/(features)/vocabulary/_components/vocabulary-filters';
import { useVocabularies } from '@/hooks/use-vocabularies';

export function VocabularyPage() {
  const { data, isPending, isError, refetch } = useVocabularies();
  // Full page: title, filters, loading/error/empty, grid and responsive layout.
  // Đây chỉ là ví dụ phụ thuộc; Agent phải viết implementation hoàn chỉnh.
  return (
    <main>
      <h1>Kho từ vựng</h1>
      <VocabularyFilters />
      {isPending ? <p>Đang tải...</p> : null}
      {isError ? <button onClick={() => void refetch()}>Thử lại</button> : null}
      {data ? <VocabularyGrid words={data} /> : null}
    </main>
  );
}
```

**Ví dụ minh họa trên không thay thế chức năng/UX đầy đủ ở mục 2.** Điểm cần đúng là: `app/**/page.tsx` không chứa JSX trang dài hoặc fetch; `features/**/<name>-page.tsx` chịu trách nhiệm **compose trọn trang**, còn các chức năng được chia ra component riêng trong `_components`, data access trong service, hooks xử lý query/lifecycle, schema validate riêng, utils thuần TS. Không viết `page.tsx` re-export thứ gì đó không khớp React component signature.

- Trang chủ: `src/app/(features)/page.tsx` -> `@/features/dashboard/dashboard-page`.
- `/learn`: `src/app/(features)/learn/page.tsx` -> `@/features/learn/learn-page`.
- `/quiz`: `src/app/(features)/quiz/page.tsx` -> `@/features/quiz/quiz-page`.
- `/admin`: `src/app/(features)/admin/page.tsx` -> `@/features/admin/admin-page`.
- `/admin/login`: `src/app/(features)/admin/login/page.tsx` -> `@/features/admin/admin-login-page`.
- Các route còn lại theo cây tương ứng.
- Nếu một page cần SEO metadata, `metadata` (server-side) chỉ export trong file route `app/**/page.tsx`; phần render vẫn delegate đến feature page. Tách Client Component boundary ở feature page nếu cần, không gắn `'use client'` lên toàn bộ `app/layout.tsx`.

### 5.3. Ma trận trách nhiệm & luật import

| Loại code | Nơi đặt DUY NHẤT | Không được đặt ở |
|---|---|---|
| Routing / layout / metadata | `src/app/**/page.tsx`, `layout.tsx` | `src/features/` |
| Page hoàn chỉnh của từng màn | `src/features/<domain>/<domain>-page.tsx` | `src/app/**/page.tsx` |
| UI component riêng một route | `src/app/(features)/<route>/_components/*.tsx` | `src/features/<domain>/components/` |
| UI component nhiều route | `src/app/_components/*.tsx` | `src/services/`, `src/features/` |
| UI primitive shadcn | `src/components/ui/*.tsx` | `src/app/_components/` (trừ wrapper riêng) |
| Zod / validation | `src/schemas/*.schema.ts` | `features`, `app/_schemas` |
| Supabase read/write / Auth API | `src/services/*.service.ts` | JSX, component, features |
| Query hooks + lifecycle hooks | `src/hooks/use-*.ts` | `features`, `app/_hooks` |
| Thuật toán quiz, timer, review, TTS | `src/utils/*.ts` | `features`, `app/_utils` |
| Domain / shared TypeScript types | `src/types/*.ts` | `features`, `app/_types` |
| Supabase client, query client, `cn` | `src/lib/` | services page, JSX |

**Hướng phụ thuộc được phép (theo kiến trúc do người dùng chọn):**

```text
app/**/page.tsx
       │
       ▼
features/**/<name>-page.tsx    (full page orchestration)
       ├──> app/**/_components/*          (private UI components)
       ├──> app/_components/*             (shared UI components)
       ├──> hooks/*  ───> services/* ───> lib/supabase/*
       ├──> schemas/*
       ├──> utils/*
       └──> types/*

app/**/_components/* ──> components/ui/*, hooks/*, schemas/*, utils/*, types/*
```

- Không import `features` từ `services`, `hooks`, `schemas`, `utils` hay `types` (tránh vòng phụ thuộc).
- Service tuyệt đối không import React components/Next route.
- Component không tự tạo Supabase client, không tự quản lý quyền CRUD; mutation qua hook/service, RLS enforce ở server DB.
- Mỗi feature page xuất **named export** (`VocabularyPage`, `QuizPage`...), chỉ App Router `page.tsx` mới dùng `export default`.
- Không tạo 2 implementation của cùng trang ở cả `app/page.tsx` lẫn `features/xxx-page.tsx`.
- **Component private chỉ là convention routing, KHÔNG là bảo mật.** Bảo vệ admin phải dùng Supabase RLS.

### 5.4. Code ví dụ cho `schemas`, `services`, `hooks`, `types`

`src/schemas/vocabulary.schema.ts` — Zod là runtime validation, schema ở root-level:

```typescript
import { z } from 'zod';

export const vocabularyFormSchema = z.object({
  word: z.string().trim().min(1),
  meaningVi: z.string().trim().min(1),
  pronunciation: z.string().trim().optional(),
  partOfSpeech: z.string().trim().optional(),
  examples: z.array(z.string().trim()).default([]),
  dayIds: z.array(z.string().uuid()).default([]),
});

export type VocabularyFormValues = z.infer<typeof vocabularyFormSchema>;
```

`src/services/vocabulary.service.ts` chỉ làm data access, không trả JSX:

```typescript
import { supabase } from '@/lib/supabase/client';
import type { VocabularyRow } from '@/types/database';

export async function getVocabularies(): Promise<VocabularyRow[]> {
  const { data, error } = await supabase
    .from('vocabularies')
    .select('id, user_id, word, meaning_vi, pronunciation, part_of_speech, examples, created_at')
    .order('word');

  if (error) throw error;
  return data;
}
```

`src/hooks/use-vocabularies.ts` (TanStack Query):

```typescript
import { useQuery } from '@tanstack/react-query';
import { getVocabularies } from '@/services/vocabulary.service';

export function useVocabularies() {
  return useQuery({
    queryKey: ['vocabularies'],
    queryFn: getVocabularies,
  });
}
```

`src/types/database.ts` để tái sử dụng type được generate:

```typescript
import type { Database } from './database.types';

type Tables = Database['public']['Tables'];
type TableName = keyof Tables;

export type TableRow<T extends TableName> = Tables[T]['Row'];
export type TableInsert<T extends TableName> = Tables[T]['Insert'];
export type TableUpdate<T extends TableName> = Tables[T]['Update'];

export type VocabularyRow = TableRow<'vocabularies'>;
export type StudyDayRow = TableRow<'study_days'>;
```

- Trên đây là **code định hướng cách phân tầng**, không phải project hoàn chỉnh. Agent phải điều chỉnh theo types Supabase thực tế và build không lỗi.
- Không tạo DTO hoặc type thủ công trùng với generated Supabase Row/Insert/Update; form values lấy từ `z.infer`, domain types chỉ khi thực sự khác schema DB.
- `src/lib/supabase/client.ts` dùng `createClient<Database>(...)`. `.env.local` không commit, không bao giờ đưa `service_role` lên browser.

### 5.5. TypeScript, React, Next.js và conventions

- `tsconfig.json`: `strict: true`, `noUncheckedIndexedAccess: true`, `noFallthroughCasesInSwitch: true`, `noEmit: true`; alias `@/* -> ./src/*`. Khuyến nghị `exactOptionalPropertyTypes` nếu tương thích. Không dùng `typescript.ignoreBuildErrors`.
- Không dùng `any`, `@ts-ignore`, `as unknown as T`, `!` trên dữ liệu runtime không chắc chắn. Prefer `unknown` + type narrowing/Zod; dùng `import type`, `satisfies`, discriminated unions cho state quiz.
- File tên **kebab-case**; React components PascalCase; biến/hàm camelCase; hooks `useXxx`; constants UPPER_SNAKE_CASE; `export default` chỉ App Router conventions (page/layout/error); feature pages dùng named export.
- `src/types/database.types.ts`: **generate từ Supabase thật** bằng Supabase CLI; cập nhật khi migration đổi schema. Ví dụ:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF --schema public > src/types/database.types.ts
```

- Runtime schema ở `src/schemas/` là nguồn chuẩn (source of truth) cho validation; form values từ `z.infer`, không định nghĩa trùng ở `types/`.
- Query keys dùng namespace và user UID cho dữ liệu cá nhân (`['progress', uid]`); xóa cache người cũ khi session/auth đổi. TanStack Query `enabled`, retry, cancellation, invalidation phải rõ ràng.
- Server Components là mặc định trong App Router. `features/*-page.tsx` dùng `'use client'` **khi cần hooks/interaction**; `app/**/page.tsx` giữ Server Component wrapper mỏng. Không server-fetch Supabase anonymous user rồi lẫn session browser nếu app static.
- `src/app/_providers/app-providers.tsx`: ổn định QueryClient instance; chứa các app-level providers và toast. `src/lib` chỉ hạ tầng, không đẩy business code vào lib.
- Quiz-engine, scheduler, timer giữ pure TypeScript trong `src/utils`; test riêng, inject đồng hồ nếu cần. Đếm ngược bằng deadline timestamp, tự nộp idempotent.
- Accessibility: aria, keyboard, focus-visible, responsive; loading/error/empty rõ ràng; không đổi UI NQT/WordNest đã thống nhất.
- Không API routes/Server Actions/Backend riêng chỉ để thao tác CRUD; Supabase JS SDK client trực tiếp + RLS + SQL migrations/RPC an toàn khi cần.
- Cài Vercel env; metadata/SEO nằm ở `app`; dùng `next/font`, Next `Link`/`Image` khi hợp lý. Không quảng cáo cloud sync khi ghi lỗi.

### 5.6. Acceptance check RIÊNG về kiến trúc (Agent phải tự xác minh)

- [ ] `src/features/` tồn tại **bên ngoài** `src/app/` và chỉ có các `*-page.tsx` (có thể có file test riêng nếu rất cần); KHÔNG có `components/`, `hooks/`, `services/`, `schemas/`, `utils/` bên dưới features.
- [ ] Tất cả `src/app/**/page.tsx` chỉ import page từ `src/features/` rồi return; không viết full JSX/CRUD/fetch trong route page.
- [ ] Page implementation đầy đủ (header, filter, table, form states, quiz...) nằm trong `src/features/` theo từng màn hình.
- [ ] Component business dùng một route nằm trong route đó `app/**/_components/`; shared business UI tại `src/app/_components/`.
- [ ] `src/schemas/`, `src/services/`, `src/types/`, `src/hooks/`, `src/utils/` **cùng cấp với** `src/app/`, không chui vào `app` hoặc `features`.
- [ ] Không có `app/**/_hooks`, `app/**/_services`, `app/**/_schemas`, `app/**/_utils` hoặc `features/**/services`.
- [ ] `src/components/ui/` chứa shadcn primitives; đừng tự đặt tên `_components` ngoài app và tuyên bố private routing.
- [ ] `src/lib/supabase/client.ts` typed với generated Database; test RLS admin/learner, không hardcode từ vựng trong Cloud Mode.
- [ ] `npm run lint` (nếu tồn tại), `npx tsc --noEmit`, `npm run build` đều pass; route /admin/login + các route học hoạt động.

---

## 6. Hành vi UX chi tiết

### 6.1. Empty/loading/error

- Chưa có ngày: dashboard hiện `Chưa có ngày học`, link xem trang từ vựng và thông báo nội dung do admin quản lý.
- Không có từ: `Chưa có từ vựng`, nút quiz/learn disabled cùng mô tả lý do.
- MCQ không đủ distractor: hiển thị `Cần ít nhất 4 từ có nghĩa khác nhau để tạo trắc nghiệm 4 đáp án`.
- Supabase lỗi: banner hoặc error-state `Không thể tải dữ liệu. Thử lại`, không hiển thị dữ liệu demo giả.
- Mutation loading: disable submit, spinner, chống double click; success/error toast.
- Admin không có quyền: thông báo từ chối, không tự thêm UID vào bảng admin.
- TTS không được hỗ trợ: disable button và tooltip giải thích.

### 6.2. Access & keyboard

- Form inputs có label, lỗi ngay dưới input.
- MCQ option dùng button/radio với aria-pressed/selection; có hỗ trợ Enter/Space.
- Modal/Dialog có focus management và Escape.
- Focus-visible rõ nét. Không dựa chỉ vào màu xanh/đỏ để báo đúng/sai.
- Tiếng Việt UTF-8 không lỗi dấu; các từ IPA hiển thị chính xác.
- Chuyển trang lúc quiz đang làm có cảnh báo nếu chưa lưu.

### 6.3. Làm việc với Date/Time

- Lưu `started_at`, `ended_at`, `created_at` là timestamptz ISO; render theo timezone trình duyệt (`Asia/Ho_Chi_Minh` khi ở Việt Nam, không hardcode giờ server).
- `study_date` lưu ngày dạng `YYYY-MM-DD`; không lệch 1 ngày vì `toISOString()` khi ghi Date-only.
- Phân biệt `thời lượng đếm ngược` với `giờ học hằng ngày`. Không tự push khi web đóng nếu chưa tích hợp dịch vụ thông báo.

---

## 7. Triển khai theo thứ tự (Agent phải làm thật)

**Phase A — Audit repo + dựng layout**

- Đọc repo hiện tại, dependency, aliases, Tailwind config.
- Nếu có ZIP WordNest tham chiếu, so sánh thiết kế và luồng UI từng trang nhưng thay toàn bộ branding bằng NQT.
- Setup font, color tokens NQT, AppShell/Sidebar/Topbar trong `src/app/_components`, responsive; route `app/**/page.tsx` chỉ render feature page, mỗi `src/features/<domain>/*-page.tsx` compose đầy đủ màn hình.

**Phase B — Supabase + Auth + Security**

- Viết SQL migration bổ sung admin/RLS tương thích 6 bảng đã có.
- Supabase client + async session initialization + anonymous auth.
- Queries từ Supabase thật ở `src/services/`, hooks ở `src/hooks/`, không sample trong production.
- Admin OTP flow + check table `app_admins` + RLS real enforcement.

**Phase C — Features**

- Library: list/search/filter/read pronunciation.
- Day multi-picker + flashcards + timer.
- Quiz engine 2 dạng + timer + result + persist progress/session.
- Review, Stats, Settings, backup, email recovery.
- Admin Day CRUD + Vocabulary CRUD + relation many-to-many.

**Phase D — Verify + deliver**

- Chạy `npm install` → `npm run lint` (nếu cấu hình) → `npx tsc --noEmit` → `npm run build`.
- Test các luồng dưới đây. Sửa lỗi cho đến khi pass; không trả lời “done” khi chưa build.
- Cập nhật `README.md` và `AGENT_HANDOFF.md` liệt kê lệnh, migration, env, các tính năng thực sự hoàn thành, thiếu sót nếu có. Kèm cây thư mục thực tế; chứng minh `src/features/` chỉ chứa page hoàn chỉnh, `src/app/**/page.tsx` chỉ gọi feature page, component business nằm trong `app/**/_components`, còn `src/hooks`, `src/services`, `src/schemas`, `src/utils`, `src/types` ngang cấp `src/app`; `src/types/database.types.ts` là generated đúng schema.
- Nếu Agent có thể, chạy dev và kiểm tra viewport desktop/mobile; so sánh screenshot với ZIP cũ.

---

## 8. Test / acceptance checklist bắt buộc

### Tính năng

- [ ] Dashboard dữ liệu tính thật từ Supabase, không hardcode.
- [ ] Tìm kiếm Anh/Việt, lọc Day.
- [ ] Một từ thuộc Day 1 và Day 3; chọn cả hai **không lặp từ**.
- [ ] Thêm Day 4 trong admin → người học nhìn thấy ngay sau refresh/invalidation.
- [ ] Thêm word với 2 examples; MCQ sinh tối đa 1 câu cho word, Fill sinh câu theo ví dụ có `[]`.
- [ ] MCQ luôn 4 nghĩa khác nhau, trộn vị trí đúng.
- [ ] Fill `[accommodate]` → `________`, nhập `Accommodate` hoặc ` accommodate ` đều được coi đúng.
- [ ] Không có đủ 4 nghĩa → không tạo câu trắc nghiệm hỏng.
- [ ] Timer 1 phút (hoặc cấu hình) hết → tự nộp, không lưu 2 lần.
- [ ] Tiến độ đúng/sai lưu cloud, refresh vẫn còn.
- [ ] Thống kê đọc từ `study_sessions`, không tự chế score.
- [ ] Giọng đọc English hoạt động khi browser có speech engine.
- [ ] JSON export hợp lệ, import có validation, người học không thể import chỉnh sửa curriculum.
- [ ] Sau khi liên kết email thành công, thử phục hồi trên trình duyệt riêng; xác thực và kiểm tra cùng tiến độ cũ.

### Bảo mật

- [ ] Client anonymous **SELECT** được Day/Word.
- [ ] Client anonymous **KHÔNG INSERT** vào Day/Word/Join, kể cả gọi Supabase SDK thủ công qua DevTools.
- [ ] Client anonymous **KHÔNG UPDATE/DELETE** curriculum.
- [ ] Admin OTP nhưng **không ở `app_admins`** vẫn bị chặn CRUD.
- [ ] Admin được thêm/sửa/xóa Day/Word/Join hợp lệ.
- [ ] Learner A không đọc/sửa được progress, sessions, settings của Learner B.
- [ ] `.env.local` không commit; service_role/secret key không xuất hiện ở repo frontend.

### Chất lượng

- [ ] `npm run dev` khởi động không lỗi.
- [ ] `npx tsc --noEmit` pass ở cấu hình `strict` và không dùng `any` né type; các TypeScript types database được generate từ Supabase. Cấu trúc `features` chỉ full-page; route `page.tsx` chỉ delegate; root-level folders đúng vị trí.
- [ ] `npm run build` pass.
- [ ] Không hydration mismatch, không request loop/đăng nhập anonymous lặp.
- [ ] Mobile 390px, tablet 768px, desktop 1440px không tràn ngang.
- [ ] Không route nào lỗi 404; sidebar active đúng route.
- [ ] Giao diện giữ gần sát WordNest ZIP tham chiếu: **sidebar trắng, tím lavender, hero gradient, dashboard 4 stats, Day cards, Word cards, flashcards, quiz UI**.

---

## 9. README cần hướng dẫn người dùng không biết Supabase

Phải ghi rõ bằng tiếng Việt, từng bước:

1. Người dùng đã có 6 bảng trong Supabase; **không chạy SQL tạo lại 6 bảng**. Chạy migration admin nếu chưa có.
2. Supabase Authentication → bật **Anonymous Sign-Ins** và Email OTP; cấu hình Email template để có `{{ .Token }}`. Cấu hình Site URL/Redirect URLs nếu cần.
3. Tạo admin: vào `/admin/login`, verify email trước, sau đó trong Supabase SQL Editor chạy câu lệnh bootstrap thêm `auth.users.id` vào `app_admins`. Refresh để được CRUD.
4. Project URL + Publishable Key ở đâu; tạo `.env.local` từ `.env.example`.
5. Chạy `npm install`, `npm run dev`, mở `http://localhost:3000`.
6. Hướng dẫn đăng Day → thêm Word → chọn Day → học → kiểm tra → xem thống kê.
7. Hướng dẫn Settings → liên kết email khôi phục; nhấn mạnh **anonymous chưa liên kết email sẽ mất đường khôi phục nếu xóa storage**.
8. Deploy Vercel: push GitHub, add Vercel env, deploy; cài Supabase Auth allowed redirects. Không sử dụng mật khẩu DB/secret key ở Frontend.

---

## 10. Tham chiếu và quyết định khi có xung đột

**Thứ tự ưu tiên:**

1. **Bảo mật/đúng dữ liệu (Supabase, RLS, CRUD admin only)**;
2. **Phạm vi chức năng NQT Vocabulary trong tài liệu này**;
3. **Độ giống UI của ZIP tham chiếu**;
4. **Conventions của repo Next.js người dùng đang cung cấp**;
5. Gu cá nhân của Agent (không được tự ý đổi style).

Nếu bản ZIP cũ có `sample.ts`, `Demo Mode`, CSS/Context monolithic, login/admin giả, hoặc lưu localStorage thay cloud, **không sao chép những thiết kế kỹ thuật này**. Chỉ kế thừa giao diện/bố cục, copywriting và trải nghiệm người dùng; sửa các điểm kỹ thuật như đặc tả.

**Chỉ kết thúc khi có mã nguồn thực sự, migration SQL, README, và báo cáo test/build.** Không trả về mô tả chung chung hoặc chỉ tạo mockup. Không yêu cầu người dùng tự sửa hàng chục file nếu Agent có quyền viết file.

### Documentation links để Agent tự đối chiếu API hiện hành

- https://nextjs.org/docs/app/getting-started/project-structure
- https://nextjs.org/docs/app/api-reference/config/typescript
- https://supabase.com/docs/guides/api/rest/generating-types

- https://nextjs.org/docs/app/guides/static-exports
- https://supabase.com/docs/guides/auth/auth-anonymous
- https://supabase.com/docs/guides/auth/auth-email-passwordless
- https://supabase.com/docs/guides/auth/auth-identity-linking
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://ui.shadcn.com/docs/installation/next

**KẾT QUẢ CUỐI CÙNG:** Website thương hiệu **NQT** (NQT Vocabulary), giữ visual giống WordNest trong ZIP, chạy bằng Next.js App Router + shadcn/ui, với `app` làm route mỏng, `features` chỉ chứa page hoàn chỉnh, `app/**/_components` chứa UI component và các `schemas/services/types/hooks/utils` ngang cấp `app`. Dùng PostgreSQL Supabase thật, người học vào học ngay không đăng nhập, chỉ admin được CRUD ngày học/từ vựng, quiz 2 kiểu + gộp Day + timer + thống kê + dữ liệu cloud và cơ chế khôi phục an toàn.
