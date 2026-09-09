# `app/` — ứng dụng quản trị dữ liệu số hóa Văn Miếu – Quốc Tử Giám

React 19 + Vite + TypeScript, CSS Modules, `react-router-dom`. Toàn bộ nghiệp vụ chạy trên lớp dịch
vụ giả lập trong `src/services/mock/` để thay bằng API thật mà không phải sửa giao diện.

```bash
npm install && npm run dev
```

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` | Máy chủ phát triển |
| `npm run build` | Đóng gói bản phát hành |
| `npm test` | Kiểm thử (`node --experimental-strip-types --test`) |
| `npm run lint` | Oxlint |
| `npx tsc --noEmit -p tsconfig.app.json` | Kiểm tra kiểu tĩnh |

Tài liệu dự án, quy ước phát triển và các quyết định kiến trúc nằm ở thư mục gốc:
[README](../README.md) · [CONTRIBUTING](../CONTRIBUTING.md) · [Quyết định kiến trúc](../docs/adr/README.md)
