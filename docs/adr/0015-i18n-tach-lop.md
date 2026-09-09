# 0015. i18n tách lớp: tiếng Việt hoàn chỉnh giai đoạn 1, `en`/`fr` sinh tự động

## Bối cảnh

Thuyết minh kỹ thuật xác định rõ (mục 3.4): "đa ngữ đầy đủ" (dịch toàn bộ giao diện sang tiếng
Anh và mở rộng ngôn ngữ khác) thuộc **Giai đoạn 2**, không phải giai đoạn 1. Nhưng kiến trúc dữ
liệu và mã nguồn giai đoạn 1 vẫn phải chuẩn bị sẵn khung đa ngữ để giai đoạn 2 không phải chuyển
đổi lại. Đồng thời, chuỗi giao diện tra cứu bằng khóa dạng chuỗi tự do (string key) rất dễ gõ sai
(`t('uplaod.addToQueueBtn')` thay vì `upload...`) mà lỗi chỉ lộ ra khi chạy tay từng màn, không
phải lúc biên dịch.

## Quyết định

`vi.ts` là **nguồn sự thật (source of truth)** đầy đủ tiếng Việt. `en.ts`/`fr.ts` dùng hàm
`emptyLike()` để **tự sinh cấu trúc khóa giống hệt `vi.ts`** nhưng giá trị rỗng — thêm khóa mới ở
`vi.ts` thì `en`/`fr` tự động có khóa đó (rỗng) mà không cần sửa tay, không thể lệch cấu trúc giữa
các ngôn ngữ. Hàm `t()` luôn fallback về `vi` khi ngôn ngữ đích còn rỗng, nên không có chuỗi trống
nào lộ ra UI dù `en`/`fr` chưa dịch. Kiểu `TranslationKey` là kiểu dot-path đệ quy suy ra tự động
từ `typeof vi` — gõ sai khóa là **lỗi biên dịch**, không phải lỗi runtime im lặng.

## Trạng thái

Đã chấp nhận — 12/08/2026.

## Hệ quả

**Tích cực:** Không bao giờ lệch cấu trúc khóa giữa 3 ngôn ngữ. Gõ sai khóa bị chặn ngay lúc build
(TypeScript), không phải khi test thủ công từng màn. Đúng phạm vi giai đoạn 1 (chỉ cần tiếng Việt
hoàn chỉnh), khung đã sẵn sàng cho giai đoạn 2 dịch tiếp mà không cần chuyển đổi lại cấu trúc dữ
liệu.

**Tiêu cực:** `en`/`fr` hiện chưa có bản dịch thật nào (100% rỗng, luôn fallback về `vi`) — nếu
cần minh họa UI tiếng Anh trong demo/hồ sơ, hiện tại chỉ chứng minh được kiến trúc chạy được, chưa
có nội dung dịch để trình chiếu.

**Rủi ro:** `TranslationKey` suy ra từ toàn bộ cây `vi` — cây càng lớn, thời gian kiểm tra kiểu
(type-check) của TypeScript càng tăng; cần theo dõi hiệu năng build khi `vi.ts` phình to theo thời
gian.

## Phương án đã cân nhắc và lý do loại

- **Dịch song song cả ba ngôn ngữ ngay từ giai đoạn 1**: loại vì ngoài phạm vi C6 (thuyết minh mục
  3.4 liệt kê "đa ngữ đầy đủ" là Giai đoạn 2), tốn công dịch thuật không cần thiết khi IA còn đang
  thay đổi (chuỗi có thể đổi liên tục theo các quyết định 0bis–0septies).
- **Dùng khóa dạng chuỗi tự do không kiểm tra kiểu (kiểu i18next mặc định)**: loại vì mất khả năng
  bắt lỗi gõ sai khóa lúc biên dịch, lỗi chỉ lộ ra khi chạy tay từng màn hình.
- **Để `en.ts`/`fr.ts` là object rỗng hoàn toàn thay vì `emptyLike` tự sinh cấu trúc**: loại vì
  `TranslationKey` (suy từ `vi`) vẫn cho phép gọi khóa đó trên `en`/`fr` nhưng lookup sẽ thất bại
  lúc runtime nếu không mirror đúng cấu trúc — `emptyLike` đảm bảo mọi khóa luôn tồn tại (dù rỗng)
  để cơ chế fallback hoạt động nhất quán.

## Liên kết

- `docs/00-ke-hoach-nang-cap.md` mục C6
- `docs/01-thuyet-minh-ky-thuat.md` mục 4.13 (CN-13), 8.6
- `app/src/i18n/index.ts` (`t()`, `TranslationKey`, fallback)
- `app/src/i18n/vi.ts`, `app/src/i18n/en.ts` (`emptyLike`), `app/src/i18n/fr.ts`
