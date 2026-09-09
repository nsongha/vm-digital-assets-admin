import type { PhysicalSpecs } from './physicalSpecs';

// Dữ liệu đo thật (0sexies) cho các đối tượng di sản đã có khảo sát/số hoá.
// Đối tượng KHÔNG có khoá tại đây = chưa có số đo — màn Chi tiết hiển thị
// trạng thái rỗng kèm nút "Ghi nhận số đo" (không suy diễn số liệu thay).
//
// Quy ước: mỗi dòng đo `quet3D` có `derivedFrom` trỏ đúng mã bản ghi dữ liệu
// số đã dùng để đo (vết tích 0quater), và ngày đo trùng ngày cập nhật của
// bản ghi đó trong data/objects/*.ts — đo trên bản số tại đúng thời điểm bản
// số đó có, không bịa mốc thời gian khác. Các dòng đo tay (thuocDay/thuocKep)
// mang ngày khảo sát hiện trường thật (có thể trước đợt số hoá).

export const PHYSICAL_SPECS_DATA: Record<string, PhysicalSpecs> = {
  // Khuê Văn Các — structures.ts seq 1 → VM-CT-00001
  'VM-CT-00001': {
    measurements: [
      {
        type: 'dienTich', part: 'mặt bằng xây dựng (thân gác vuông tầng trên)', value: 8.8, unit: 'm²',
        qualifier: 'xapXi', method: 'trichBanVe', measuredBy: 'Lê Thu Trang', measuredAt: '28/07/2026',
        derivedFrom: 'VM-CT-00001.DWG01',
      },
      {
        type: 'cao', part: 'từ nền đến bờ nóc', value: 8.8, unit: 'm',
        qualifier: 'xapXi', method: 'quet3D', measuredBy: 'Trần Văn Minh', measuredAt: '01/08/2026',
        derivedFrom: 'VM-CT-00001.PCL01',
      },
      {
        type: 'rong', part: 'mặt bằng (cạnh vuông tầng gác trên)', value: 2.97, unit: 'm',
        qualifier: 'xapXi', method: 'trichBanVe', measuredBy: 'Lê Thu Trang', measuredAt: '28/07/2026',
        derivedFrom: 'VM-CT-00001.DWG01',
      },
    ],
    fields: {
      soGian: { text: '1 gian vuông, bốn mặt thoáng, mỗi mặt trổ 2 cửa sổ tròn' },
      soTangMai: { text: '2 tầng, 8 mái (kiến trúc chồng diêm)' },
      soCot: { text: '4 trụ gạch vuông đỡ tầng gác gỗ phía trên' },
      duongKinhCot: { missing: 'KHONG_AP_DUNG', note: 'trụ vuông, không đo theo đường kính tròn — xem trường Số cột' },
      vatLieuChinh: { text: 'Tầng dưới: trụ gạch; tầng trên: khung gỗ, mái ngói' },
      huongCongTrinh: { text: 'Nam (theo trục thần đạo Bắc – Nam của tổng thể di tích)' },
      caoDoNen: { missing: 'CHUA_XAC_DINH', note: 'chưa có số liệu trắc địa cao độ nền, chờ khảo sát' },
      tinhTrangBaoQuan: { text: 'Tình trạng tốt, được bảo trì định kỳ; chưa ghi nhận hư hỏng kết cấu lớn' },
    },
    location: {
      phanKhu: 'Khu thứ hai',
      viTriCuThe: 'Trên trục thần đạo, giữa Đại Trung Môn và Giếng Thiên Quang',
      wgs84: { lat: 21.0287, lng: 105.8354 },
    },
  },

  // Giếng Thiên Quang & sân bia — precincts.ts seq 1 → VM-KV-00001
  'VM-KV-00001': {
    measurements: [
      {
        type: 'dienTich', part: 'toàn phân khu (giếng + sân bia hai bên)', value: 3200, unit: 'm²',
        qualifier: 'xapXi', method: 'quet3D', measuredBy: 'Trần Văn Minh', measuredAt: '06/08/2026',
        derivedFrom: 'VM-KV-00001.PCL01',
      },
      {
        type: 'chuVi', part: 'ranh giới toàn phân khu', value: 240, unit: 'm',
        qualifier: 'xapXi', method: 'trichBanVe', measuredBy: 'Lê Thu Trang', measuredAt: '02/08/2026',
        derivedFrom: 'VM-KV-00001.DWG01',
      },
      {
        type: 'doSau', part: 'lòng giếng (mặt nước tới đáy)', value: 1.2, unit: 'm',
        qualifier: 'uocLuong', method: 'thuocDay',
        measuredBy: 'Tổ khảo sát kiến trúc — Trung tâm Hoạt động Văn hóa Khoa học Văn Miếu — Quốc Tử Giám',
        measuredAt: '15/03/2025',
      },
    ],
    fields: {
      lopPhuBeMat: { text: 'Mặt nước (giếng vuông) ở giữa; sân lát gạch Bát Tràng hai bên dọc dãy bia' },
      caoDo: { missing: 'CHUA_XAC_DINH', note: 'chưa có số liệu trắc địa cao độ chính xác' },
      ranhGioi: { missing: 'CHUA_XAC_DINH', note: 'chưa số hoá dạng đa giác toạ độ; có thể trích từ VM-KV-00001.DWG01 khi cần' },
    },
    location: {
      phanKhu: 'Khu thứ ba',
      viTriCuThe: 'Giữa hai dãy Vườn bia Tiến sĩ, đối diện Khuê Văn Các qua trục thần đạo',
      wgs84: { lat: 21.0283, lng: 105.8352 },
    },
  },

  // Bia Tiến sĩ khoa Nhâm Tuất (1442) — artifacts.ts seq 1 → VM-HV-00001
  'VM-HV-00001': {
    measurements: [
      {
        type: 'cao', part: 'thân bia', value: 1.08, unit: 'm', qualifier: 'xapXi', method: 'thuocDay',
        measuredBy: 'Tổ kiểm kê hiện vật — Trung tâm Hoạt động Văn hóa Khoa học Văn Miếu — Quốc Tử Giám',
        measuredAt: '14/11/2015',
      },
      {
        type: 'cao', part: 'trán bia', value: 0.42, unit: 'm', qualifier: 'xapXi', method: 'thuocDay',
        measuredBy: 'Tổ kiểm kê hiện vật — Trung tâm Hoạt động Văn hóa Khoa học Văn Miếu — Quốc Tử Giám',
        measuredAt: '14/11/2015',
      },
      {
        type: 'cao', part: 'thân bia', value: 1.1, unit: 'm', qualifier: 'chinhXac', method: 'quet3D',
        measuredBy: 'Trần Văn Minh', measuredAt: '10/08/2026', derivedFrom: 'VM-HV-00001.M3D01',
      },
      {
        type: 'rong', part: 'thân bia', value: 0.73, unit: 'm', qualifier: 'chinhXac', method: 'quet3D',
        measuredBy: 'Trần Văn Minh', measuredAt: '10/08/2026', derivedFrom: 'VM-HV-00001.M3D01',
      },
      {
        type: 'day', part: 'thân bia', value: 0.21, unit: 'm', qualifier: 'chinhXac', method: 'quet3D',
        measuredBy: 'Trần Văn Minh', measuredAt: '10/08/2026', derivedFrom: 'VM-HV-00001.M3D01',
      },
      {
        type: 'cao', part: 'trán bia', value: 0.4, unit: 'm', qualifier: 'chinhXac', method: 'quet3D',
        measuredBy: 'Trần Văn Minh', measuredAt: '10/08/2026', derivedFrom: 'VM-HV-00001.M3D01',
      },
      {
        type: 'rong', part: 'rùa đội bia (đế)', value: 1.3, unit: 'm', qualifier: 'xapXi', method: 'thuocDay',
        measuredBy: 'Tổ kiểm kê hiện vật — Trung tâm Hoạt động Văn hóa Khoa học Văn Miếu — Quốc Tử Giám',
        measuredAt: '14/11/2015',
      },
    ],
    fields: {
      chatLieu: { text: 'Đá xanh nguyên khối, thân bia và trán bia tạc liền khối' },
      kyThuatCheTac: { text: 'Chạm khắc đá truyền thống; trán bia chạm rồng chầu mặt trời' },
      soChuMinhVan: {
        missing: 'CHUA_XAC_DINH',
        note: 'chưa đếm chính xác, cần chuyên gia Hán Nôm đối chiếu — đã có bản scan 3D độ phân giải 0,2mm làm cơ sở đếm sau này',
      },
      soDongMinhVan: { missing: 'CHUA_XAC_DINH', note: 'chưa đếm chính xác, cần chuyên gia Hán Nôm đối chiếu' },
      tinhTrangBaoQuan: {
        text: 'Bề mặt phong hoá nhẹ, chữ khắc còn đọc được phần lớn; đã lập hồ sơ scan 3D độ phân giải cao làm cơ sở theo dõi xuống cấp',
      },
      huongDat: { text: 'Quay mặt vào trong sân bia (hướng chung của dãy Đông)' },
    },
    location: {
      phanKhu: 'Khu thứ ba',
      congTrinh: 'Vườn bia Tiến sĩ — Nhà bia dãy Đông',
      viTriCuThe: 'Dãy Đông, bia số 1 (theo thứ tự khoa thi)',
    },
    conservation: {
      yeuCauDacThu: 'Có mái che (nhà bia) nhưng vẫn chịu ảnh hưởng thời tiết ngoài trời; theo dõi định kỳ rêu mốc, nứt bề mặt đá và lún nền.',
    },
  },

  // Bia Tiến sĩ khoa Quý Mùi (1463) — artifacts.ts seq 7 → VM-HV-00007
  'VM-HV-00007': {
    measurements: [
      {
        type: 'cao', part: 'thân bia', value: 1.15, unit: 'm', qualifier: 'xapXi', method: 'thuocDay',
        measuredBy: 'Ngô Bảo Ngọc', measuredAt: '20/02/2020',
      },
      {
        type: 'rong', part: 'thân bia', value: 0.7, unit: 'm', qualifier: 'xapXi', method: 'thuocDay',
        measuredBy: 'Ngô Bảo Ngọc', measuredAt: '20/02/2020',
      },
      {
        type: 'cao', part: 'trán bia', value: 0.38, unit: 'm', qualifier: 'xapXi', method: 'thuocDay',
        measuredBy: 'Ngô Bảo Ngọc', measuredAt: '20/02/2020',
      },
      {
        type: 'rong', part: 'rùa đội bia (đế)', value: 1.25, unit: 'm', qualifier: 'uocLuong', method: 'thuocDay',
        measuredBy: 'Ngô Bảo Ngọc', measuredAt: '20/02/2020',
      },
    ],
    fields: {
      chatLieu: { text: 'Đá xanh nguyên khối' },
      kyThuatCheTac: { text: 'Chạm khắc đá truyền thống' },
      soChuMinhVan: { missing: 'CHUA_XAC_DINH', note: 'chưa đếm chính xác, cần chuyên gia Hán Nôm đối chiếu' },
      soDongMinhVan: { missing: 'CHUA_XAC_DINH', note: 'chưa đếm chính xác, cần chuyên gia Hán Nôm đối chiếu' },
      tinhTrangBaoQuan: { text: 'Tình trạng chung ổn định, chưa ghi nhận hư hại lớn' },
    },
    location: {
      phanKhu: 'Khu thứ ba',
      congTrinh: 'Vườn bia Tiến sĩ',
    },
    conservation: {
      yeuCauDacThu: 'Có mái che (nhà bia) nhưng vẫn chịu ảnh hưởng thời tiết ngoài trời; theo dõi định kỳ rêu mốc, nứt bề mặt đá và lún nền.',
    },
  },

  // Rùa đá đội bia số 12 — artifacts.ts seq 2 → VM-HV-00002
  'VM-HV-00002': {
    measurements: [
      {
        type: 'cao', part: 'toàn bộ (đế tới lưng đội bia)', value: 0.55, unit: 'm', qualifier: 'xapXi', method: 'thuocDay',
        measuredBy: 'Tổ kiểm kê hiện vật — Trung tâm Hoạt động Văn hóa Khoa học Văn Miếu — Quốc Tử Giám',
        measuredAt: '20/02/2020',
      },
      {
        type: 'rong', part: 'toàn bộ (dài đầu — đuôi)', value: 1.28, unit: 'm', qualifier: 'xapXi', method: 'thuocDay',
        measuredBy: 'Tổ kiểm kê hiện vật — Trung tâm Hoạt động Văn hóa Khoa học Văn Miếu — Quốc Tử Giám',
        measuredAt: '20/02/2020',
      },
      {
        type: 'rong', part: 'toàn bộ (dài đầu — đuôi)', value: 1.3, unit: 'm', qualifier: 'xapXi', method: 'quet3D',
        measuredBy: 'Trần Văn Minh', measuredAt: '10/08/2026', derivedFrom: 'VM-HV-00002.M3D01',
      },
      {
        type: 'day', part: 'toàn bộ (rộng ngang thân)', value: 0.85, unit: 'm', qualifier: 'xapXi', method: 'thuocDay',
        measuredBy: 'Tổ kiểm kê hiện vật — Trung tâm Hoạt động Văn hóa Khoa học Văn Miếu — Quốc Tử Giám',
        measuredAt: '20/02/2020',
      },
    ],
    fields: {
      chatLieu: { text: 'Đá xanh nguyên khối' },
      kyThuatCheTac: { text: 'Chạm khắc đá, tạo hình rùa đội tấm đế đỡ bia' },
      soChuMinhVan: { missing: 'KHONG_AP_DUNG' },
      soDongMinhVan: { missing: 'KHONG_AP_DUNG' },
      tinhTrangBaoQuan: { text: 'Vùng đế có vết sứt nhẹ, đang xử lý vá lỗ trong bản scan 3D structured light (VM-HV-00002.M3D01)' },
      huongDat: { text: 'Đầu quay ra phía lối đi giữa hai dãy nhà bia' },
    },
    location: {
      phanKhu: 'Khu thứ ba',
      congTrinh: 'Vườn bia Tiến sĩ',
      viTriCuThe: 'Dãy Tây, đội bia số 12',
    },
    conservation: {
      yeuCauDacThu: 'Có mái che (nhà bia) nhưng vẫn chịu ảnh hưởng thời tiết ngoài trời; theo dõi định kỳ rêu mốc, nứt bề mặt đá và lún nền.',
    },
  },

  // Chuông Bích Ung đại chung — artifacts.ts seq 3 → VM-HV-00003
  'VM-HV-00003': {
    measurements: [
      {
        type: 'cao', part: 'toàn bộ (kể quai treo)', value: 1.15, unit: 'm', qualifier: 'xapXi', method: 'thuocDay',
        measuredBy: 'Lê Thu Trang', measuredAt: '05/06/2019',
      },
      {
        type: 'duongKinh', part: 'miệng chuông', value: 0.62, unit: 'm', qualifier: 'xapXi', method: 'thuocDay',
        measuredBy: 'Lê Thu Trang', measuredAt: '05/06/2019',
      },
      {
        type: 'doDayThanh', part: 'thành chuông (tại miệng)', value: 18, unit: 'mm', qualifier: 'xapXi', method: 'thuocKep',
        measuredBy: 'Lê Thu Trang', measuredAt: '05/06/2019',
      },
      {
        type: 'duongKinh', part: 'miệng chuông', value: 0.615, unit: 'm', qualifier: 'xapXi', method: 'quet3D',
        measuredBy: 'Lê Thu Trang', measuredAt: '09/08/2026', derivedFrom: 'VM-HV-00003.M3D01',
      },
    ],
    fields: {
      chatLieu: { text: 'Đồng đúc' },
      kyThuatCheTac: { text: 'Đúc đồng truyền thống, thân chuông khắc hoa văn và minh văn' },
      soChuMinhVan: { missing: 'CHUA_XAC_DINH', note: 'đang thẩm định nội dung minh văn (song thẩm Hán Nôm), số chữ chưa chốt' },
      soDongMinhVan: { missing: 'CHUA_XAC_DINH', note: 'đang thẩm định nội dung minh văn (song thẩm Hán Nôm), số dòng chưa chốt' },
      tinhTrangBaoQuan: { text: 'Hoa văn và minh văn còn rõ nét; treo trong nhà có mái che, ít chịu tác động thời tiết trực tiếp' },
      huongDat: { missing: 'KHONG_AP_DUNG', note: 'chuông treo cố định, không áp dụng khái niệm hướng đặt trên nền' },
    },
    location: {
      phanKhu: 'Khu thứ tư',
      congTrinh: 'Nhà Bái Đường',
      viTriCuThe: 'Treo tại gian giữa Nhà Bái Đường',
    },
    conservation: {
      yeuCauDacThu:
        'Nhà Bái Đường thông gió tự nhiên, không có kiểm soát nhiệt-ẩm chủ động; theo dõi định kỳ tình trạng patina và mối mọt cột gỗ xung quanh khu vực treo.',
    },
  },

  // Khánh đá điện Đại Thành — artifacts.ts seq 10 → VM-HV-00010
  'VM-HV-00010': {
    measurements: [
      {
        type: 'cao', part: 'toàn bộ (không tính dây treo)', value: 0.58, unit: 'm', qualifier: 'xapXi', method: 'thuocDay',
        measuredBy: 'Đỗ Anh Quân', measuredAt: '08/08/2026',
      },
      {
        type: 'rong', part: 'toàn bộ (cạnh đáy)', value: 0.9, unit: 'm', qualifier: 'xapXi', method: 'thuocDay',
        measuredBy: 'Đỗ Anh Quân', measuredAt: '08/08/2026',
      },
      {
        type: 'day', part: 'toàn bộ (độ dày phiến đá)', value: 0.045, unit: 'm', qualifier: 'xapXi', method: 'thuocKep',
        measuredBy: 'Đỗ Anh Quân', measuredAt: '08/08/2026',
      },
    ],
    fields: {
      chatLieu: { text: 'Đá phiến, màu xám xanh' },
      kyThuatCheTac: { text: 'Chạm khắc đá, khắc chìm minh văn' },
      soChuMinhVan: { text: '2 (khắc 2 chữ "Thọ Xương")' },
      soDongMinhVan: { missing: 'KHONG_AP_DUNG', note: 'chỉ khắc 2 chữ đơn lẻ, không phải văn bản nhiều dòng' },
      tinhTrangBaoQuan: { text: 'Bề mặt còn rõ nét khắc; treo trong nhà có mái che nên ít chịu tác động thời tiết trực tiếp' },
      huongDat: { missing: 'KHONG_AP_DUNG', note: 'hiện vật treo tường, không áp dụng khái niệm hướng đặt trên nền' },
    },
    location: {
      phanKhu: 'Khu thứ tư',
      congTrinh: 'Nhà Bái Đường',
      viTriCuThe: 'Đầu hồi phía Tây, Nhà Bái Đường',
    },
    conservation: {
      yeuCauDacThu: 'Nhà Bái Đường thông gió tự nhiên, không có kiểm soát nhiệt-ẩm chủ động; theo dõi định kỳ tình trạng nứt bề mặt đá.',
    },
  },

  // Sắc phong niên hiệu Cảnh Hưng 35 (1774) — documents.ts seq 1 → VM-TL-00001
  'VM-TL-00001': {
    measurements: [
      {
        type: 'cao', part: 'tờ', value: 0.32, unit: 'm', qualifier: 'uocLuong', method: 'thuocDay',
        measuredBy: 'Lê Thu Trang', measuredAt: '11/08/2026',
      },
      {
        type: 'rong', part: 'tờ', value: 0.5, unit: 'm', qualifier: 'uocLuong', method: 'thuocDay',
        measuredBy: 'Lê Thu Trang', measuredAt: '11/08/2026',
      },
    ],
    fields: {
      chatLieuMangTin: { text: 'Giấy dó' },
      soTo: { text: '1 tờ (số hoá thành 5 trang TIFF: 2 mặt scan + ảnh chi tiết + bản phiên âm + bản dịch nghĩa)' },
      kichThuocKhungChu: { missing: 'CHUA_XAC_DINH', note: 'chưa tách đo riêng phần khung chữ so với viền tờ' },
      soDong: { missing: 'CHUA_XAC_DINH', note: 'chờ chuyên gia Hán Nôm đối chiếu, chưa đếm chính xác' },
      soChuMoiDong: { missing: 'CHUA_XAC_DINH', note: 'chờ chuyên gia Hán Nôm đối chiếu, chưa đếm chính xác' },
      anTrien: { text: 'Một ấn son hình vuông của triều đình, góc trên bên phải' },
      tinhTrangBaoQuan: { text: 'Ố vàng nhẹ theo thời gian, chữ còn rõ, chưa ghi nhận rách/mối mọt' },
    },
    location: {
      phanKhu: 'Kho lưu trữ trung tâm',
      viTriCuThe: 'Giá số 1, hộp lưu trữ tư liệu Hán Nôm — sắc phong',
    },
    conservation: {
      nhietDoC: [18, 22],
      doAmPercent: [45, 55],
      anhSangLux: 50,
      yeuCauDacThu: 'Bảo quản trong bìa/hộp không a-xít; tránh ánh sáng trực tiếp và côn trùng gây hại giấy dó.',
    },
  },

  // Bản dập văn bia khoa thi Giáp Thìn (1484) — documents.ts seq 2 → VM-TL-00002
  'VM-TL-00002': {
    measurements: [
      {
        type: 'cao', part: 'tờ', value: 1.15, unit: 'm', qualifier: 'xapXi', method: 'thuocDay',
        measuredBy: 'Lê Thu Trang', measuredAt: '02/08/2026',
      },
      {
        type: 'rong', part: 'tờ', value: 0.78, unit: 'm', qualifier: 'xapXi', method: 'thuocDay',
        measuredBy: 'Lê Thu Trang', measuredAt: '02/08/2026',
      },
    ],
    fields: {
      chatLieuMangTin: { text: 'Giấy dó, mực nho (kỹ thuật dập bia truyền thống)' },
      soTo: { text: '1 tờ giấy khổ lớn, ghép từ 4 lần chụp phẳng khổ A0, số hoá thành 3 trang TIFF' },
      kichThuocKhungChu: { missing: 'CHUA_XAC_DINH', note: 'toàn bộ bề mặt là phần dập chữ khắc, chưa tách đo riêng khung chữ' },
      soDong: { missing: 'CHUA_XAC_DINH', note: 'cần chuyên gia Hán Nôm đối chiếu nội dung khoa thi trước khi đếm dòng' },
      soChuMoiDong: { missing: 'CHUA_XAC_DINH', note: 'cần chuyên gia Hán Nôm đối chiếu nội dung khoa thi trước khi đếm chữ' },
      anTrien: { missing: 'KHONG_AP_DUNG', note: 'bản dập văn bia không có ấn triện, khác sắc phong' },
      tinhTrangBaoQuan: { text: 'Giấy dập còn rõ nét, một số vị trí mờ do rêu mốc trên mặt bia gốc' },
    },
    location: {
      phanKhu: 'Kho lưu trữ trung tâm',
      viTriCuThe: 'Giá số 1, hộp lưu trữ tư liệu Hán Nôm — bản dập văn bia',
    },
    conservation: {
      nhietDoC: [18, 22],
      doAmPercent: [45, 55],
      anhSangLux: 50,
      yeuCauDacThu: 'Bảo quản trong bìa/hộp không a-xít; để phẳng, tránh gấp nếp mới.',
    },
  },

  // Ảnh tư liệu cổng Văn Miếu, thập niên 1920 (phim kính) — av.ts seq 1 → VM-NN-00001
  'VM-NN-00001': {
    measurements: [
      {
        type: 'cao', part: 'vật mang tin (phim kính)', value: 0.18, unit: 'm', qualifier: 'xapXi', method: 'thuocKep',
        measuredBy: 'Ngô Bảo Ngọc', measuredAt: '01/08/2026',
      },
      {
        type: 'rong', part: 'vật mang tin (phim kính)', value: 0.24, unit: 'm', qualifier: 'xapXi', method: 'thuocKep',
        measuredBy: 'Ngô Bảo Ngọc', measuredAt: '01/08/2026',
      },
    ],
    fields: {
      vatMangTinGoc: { text: 'Phim kính (glass plate negative), khổ 18×24cm, ảnh đen trắng thời Pháp thuộc' },
      tinhTrangVatMangTin: { text: 'Có vài vết xước và ố nhẹ ở góc; đã scan độ phân giải cao và phục chế bản số' },
    },
    location: {
      phanKhu: 'Kho lưu trữ trung tâm',
      viTriCuThe: 'Giá số 3, hộp lưu trữ ảnh tư liệu lịch sử — phim kính',
    },
    conservation: {
      nhietDoC: [16, 20],
      doAmPercent: [30, 40],
      anhSangLux: 50,
      yeuCauDacThu:
        'Hạn chế thao tác trực tiếp lên phim kính gốc — dùng bản số đã phục chế cho khai thác thường xuyên; bảo quản trong hộp đệm lót tránh rung động.',
    },
  },
};
