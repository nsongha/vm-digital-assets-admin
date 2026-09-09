import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  MODULES,
  MODULE_GROUPS,
  PERMISSIONS,
  PERMISSION_GROUPS,
  ROLE_OPTIONS,
  buildMatrix,
  capsForRole,
  lockReason,
  policyViolations,
  toggleCell,
} from '../src/data/permissions.ts';

// Chính sách phân quyền là thứ dễ hỏng âm thầm nhất: sửa một ô trong ma trận mặc
// định không làm hỏng build, không hiện lỗi runtime, chỉ lặng lẽ cấp thêm quyền.
// Bộ kiểm thử này khóa các bất biến lại. Chạy: `npm test`.

test('mọi vai trò mặc định đều không vi phạm quy tắc phân tách nhiệm vụ', () => {
  for (const role of ROLE_OPTIONS) {
    const violations = policyViolations(buildMatrix(role));
    assert.deepEqual(
      violations.map((v) => v.code),
      [],
      `Vai trò "${role}" có ma trận mặc định vi phạm: ${violations.map((v) => v.message).join(' | ')}`,
    );
  }
});

test('ma trận mặc định không tick ô nào bị khóa cứng theo chính sách', () => {
  for (const role of ROLE_OPTIONS) {
    const m = buildMatrix(role);
    for (const mod of MODULES) {
      for (const perm of PERMISSIONS) {
        if (lockReason(mod, perm)) {
          assert.equal(m[mod][perm], false, `"${role}" không được có quyền ${perm} trên ${mod} (ô khóa cứng)`);
        }
      }
    }
  }
});

test('không vai trò nào sửa hoặc xóa được nhật ký hoạt động (append-only)', () => {
  for (const role of ROLE_OPTIONS) {
    const m = buildMatrix(role);
    assert.equal(m['Nhật ký']['Tạo/Sửa'], false, `"${role}" không được sửa nhật ký`);
    assert.equal(m['Nhật ký'].Xóa, false, `"${role}" không được xóa nhật ký`);
  }
});

test('vai trò Quản trị không tự phê duyệt/xuất bản nội dung (nguyên tắc bốn mắt)', () => {
  const caps = capsForRole('Quản trị');
  assert.equal(caps.admin, true);
  assert.equal(caps.approve, false);
  assert.equal(caps.publish, false);
});

test('capsForRole khớp bảng quyền đã công bố trong tài liệu', () => {
  const expected = {
    'Quản trị': { read: true, write: true, approve: false, publish: false, admin: true },
    'Kỹ thuật số hóa': { read: true, write: true, approve: false, publish: false, admin: false },
    'Biên tập': { read: true, write: true, approve: false, publish: false, admin: false },
    'Phê duyệt': { read: true, write: false, approve: true, publish: true, admin: false },
    'Chỉ xem': { read: true, write: false, approve: false, publish: false, admin: false },
  };
  for (const role of ROLE_OPTIONS) {
    assert.deepEqual(capsForRole(role), expected[role], `capsForRole("${role}") lệch bảng đã công bố`);
  }
});

test('toggleCell: bật một quyền bất kỳ kéo theo quyền Xem của cùng module', () => {
  const m = toggleCell(buildMatrix('Chỉ xem'), 'Kết nối & chia sẻ', 'Tạo/Sửa');
  assert.equal(m['Kết nối & chia sẻ']['Tạo/Sửa'], true);
  assert.equal(m['Kết nối & chia sẻ'].Xem, true, 'không thể sửa thứ mình không được xem');
});

test('toggleCell: bỏ quyền Xem thì bỏ toàn bộ quyền của module đó', () => {
  const m = toggleCell(buildMatrix('Biên tập'), 'Bộ sưu tập', 'Xem');
  for (const perm of PERMISSIONS) {
    assert.equal(m['Bộ sưu tập'][perm], false, `còn sót quyền ${perm} sau khi bỏ Xem`);
  }
});

test('toggleCell không mở được ô bị khóa cứng', () => {
  const before = buildMatrix('Quản trị');
  const after = toggleCell(before, 'Nhật ký', 'Xóa');
  assert.equal(after['Nhật ký'].Xóa, false);
  assert.equal(after, before, 'ô khóa cứng phải trả về ma trận nguyên trạng');
});

test('phát hiện xung đột khi một vai trò vừa tạo vừa duyệt cùng một module', () => {
  const m = toggleCell(buildMatrix('Biên tập'), 'Dữ liệu số hóa', 'Duyệt');
  const codes = policyViolations(m).map((v) => v.code);
  assert.ok(codes.includes('SOD_TAO_DUYET'), 'phải chặn người tạo nội dung tự duyệt nội dung của mình');
});

test('phát hiện đường tự nâng quyền: quản trị tài khoản + duyệt nội dung', () => {
  let m = buildMatrix('Quản trị');
  m = toggleCell(m, 'Dữ liệu số hóa', 'Tạo/Sửa'); // bỏ Tạo/Sửa để tách khỏi xung đột SoD
  m = toggleCell(m, 'Dữ liệu số hóa', 'Duyệt');
  const codes = policyViolations(m).map((v) => v.code);
  assert.ok(codes.includes('TU_NANG_QUYEN'));
});

// Bảng vẽ vạch ngăn theo `PERMISSION_GROUPS` và dải nhóm theo `MODULE_GROUPS`. Nếu
// thêm một quyền hoặc một phân hệ mà quên khai báo vào nhóm, cột/hàng đó sẽ lặng lẽ
// biến mất khỏi bảng hoặc vạch ngăn vẽ sai chỗ — không có lỗi biên dịch nào báo.
test('PERMISSION_GROUPS phủ đúng và đủ PERMISSIONS, giữ nguyên thứ tự', () => {
  assert.deepEqual(PERMISSION_GROUPS.flatMap((g) => g.perms), [...PERMISSIONS]);
});

test('MODULE_GROUPS phủ đúng và đủ MODULES, giữ nguyên thứ tự', () => {
  assert.deepEqual(MODULE_GROUPS.flatMap((g) => g.modules), [...MODULES]);
});

test('quyền Xóa chỉ đi kèm quyền Quản trị của cùng module', () => {
  const m = toggleCell(buildMatrix('Biên tập'), 'Bộ sưu tập', 'Xóa');
  const codes = policyViolations(m).map((v) => v.code);
  assert.ok(codes.includes('XOA_KHONG_QUAN_TRI'));
});
