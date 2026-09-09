import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppUiProvider } from './context/AppUiContext';
import { AuthProvider, RequireAuth } from './context/AuthContext';
import AppShell from './layout/AppShell';
import { ThemeProvider } from './theme/ThemeContext';
import ApiKeysPage from './pages/ApiKeysPage';
import AssetDetailPage from './pages/AssetDetailPage';
import AssetsPage from './pages/AssetsPage';
import AuditLogPage from './pages/AuditLogPage';
import BackupPage from './pages/BackupPage';
import CollectionDetailPage from './pages/CollectionDetailPage';
import CollectionsPage from './pages/CollectionsPage';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import HelpPage from './pages/HelpPage';
import InventoryPage from './pages/InventoryPage';
import LoginPage from './pages/LoginPage';
import ObjectDossierPage from './pages/ObjectDossierPage';
import ObjectsPage from './pages/ObjectsPage';
import RegisterPage from './pages/RegisterPage';
import ReportsPage from './pages/ReportsPage';
import SharePage from './pages/SharePage';
import SpatialPage from './pages/SpatialPage';
import UploadPage from './pages/UploadPage';
import UserDetailPage from './pages/UserDetailPage';
import UsersPage from './pages/UsersPage';

export default function App() {
  return (
    <ThemeProvider>
      <AppUiProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Ngoài AppShell: hai màn không cần thanh điều hướng và không cần phiên đăng nhập. */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route
                element={
                  <RequireAuth>
                    <AppShell />
                  </RequireAuth>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="assets" element={<AssetsPage />} />
                <Route path="assets/:id" element={<AssetDetailPage />} />
                {/* Danh sách đối tượng vật lý (đo độ phủ số hóa) → hồ sơ chi tiết từng đối tượng. */}
                <Route path="objects" element={<ObjectsPage />} />
                <Route path="objects/:id" element={<ObjectDossierPage />} />
                <Route path="upload" element={<UploadPage />} />
                <Route path="collections" element={<CollectionsPage />} />
                <Route path="collections/:slug" element={<CollectionDetailPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                {/* KHAI THÁC — nhúng ứng dụng GaussianSplat Immersive Tour (độc lập, iframe). */}
                <Route path="editor" element={<EditorPage />} />
                <Route path="spatial" element={<SpatialPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="users/:email" element={<UserDetailPage />} />
                <Route path="api-keys" element={<ApiKeysPage />} />
                {/* Nhật ký nâng cao (B6) thay cho bảng nhật ký đơn giản của bản v3. */}
                <Route path="logs" element={<AuditLogPage />} />
                <Route path="share" element={<SharePage />} />
                <Route path="backup" element={<BackupPage />} />
                {/* Mỗi mục trợ giúp có địa chỉ riêng để gửi/lưu được đúng mục
                    (vd. /help/pl-ket-noi-truc-quoc-gia). Không có id thì hiện
                    trang mở đầu của tài liệu. */}
                <Route path="help" element={<HelpPage />} />
                <Route path="help/:entryId" element={<HelpPage />} />
                {/* Đường dẫn cũ còn nằm trong tài liệu/bookmark — chuyển hướng thay vì 404. */}
                <Route path="compliance" element={<Navigate to="/help" replace />} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </AppUiProvider>
    </ThemeProvider>
  );
}
