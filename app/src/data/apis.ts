import type { ApiEndpoint } from '../services/types';

// Ported from the `apis` array in v3.html.
export const APIS: ApiEndpoint[] = [
  { name: 'GET /api/v1/assets', kind: 'Chia sẻ mặc định', fmt: 'REST · JSON', calls: '12.480', status: 'Hoạt động' },
  { name: 'GET /api/v1/collections', kind: 'Chia sẻ mặc định', fmt: 'REST · JSON', calls: '3.240', status: 'Hoạt động' },
  { name: 'GET /api/v1/models/{id}', kind: 'Theo yêu cầu đặc thù', fmt: 'GLB · stream', calls: '860', status: 'Hoạt động' },
  { name: 'OAI-PMH /oai', kind: 'Chia sẻ mặc định', fmt: 'XML · Dublin Core', calls: '420', status: 'Thử nghiệm' },
];
