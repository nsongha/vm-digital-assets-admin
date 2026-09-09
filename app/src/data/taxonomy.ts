import type { DigitalForm, ObjectClass } from '../services/types';

// Two independent classification axes for every digitized record
// ("dữ liệu số hóa"), per CIDOC-CRM's split between a physical object and
// its digital representations:
//   - `objectClass`  — what the real heritage object IS (đối tượng di sản thật)
//   - `digitalForm`  — what KIND of digital capture this particular record is
// A single physical object (e.g. Khuê Văn Các) can have many digitalForm
// records sharing one `physicalArtifactId`.

export const OBJECT_CLASS_LABELS: Record<ObjectClass, string> = {
  precinct: 'Khuôn viên & không gian',
  structure: 'Công trình kiến trúc',
  artifact: 'Hiện vật',
  document: 'Tài liệu & di sản tư liệu',
  av: 'Tư liệu nghe nhìn',
};

export const OBJECT_CLASS_ORDER: ObjectClass[] = ['precinct', 'structure', 'artifact', 'document', 'av'];

/** Tier-1 object-code prefix per object class (0quater — 2-letter `OC`). */
export const OBJECT_CLASS_CODE_PREFIX: Record<ObjectClass, string> = {
  precinct: 'VM-KV',
  structure: 'VM-CT',
  artifact: 'VM-HV',
  document: 'VM-TL',
  av: 'VM-NN',
};

/** Tier-2 digital-form suffix per form (0quater — 3-letter `DF`). */
export const DIGITAL_FORM_CODE: Record<DigitalForm, string> = {
  mesh3d: 'M3D',
  splat: 'SPL',
  pointcloud: 'PCL',
  drawing: 'DWG',
  image: 'IMG',
  text: 'TXT',
  video: 'VID',
  audio: 'AUD',
};

export const DIGITAL_FORM_LABELS: Record<DigitalForm, string> = {
  mesh3d: 'Mô hình 3D',
  splat: 'Gaussian splat',
  pointcloud: 'Đám mây điểm',
  drawing: 'Bản vẽ kỹ thuật',
  image: 'Ảnh số',
  text: 'Văn bản số',
  video: 'Video',
  audio: 'Âm thanh',
};

export const DIGITAL_FORM_ORDER: DigitalForm[] = [
  'mesh3d',
  'splat',
  'pointcloud',
  'drawing',
  'image',
  'text',
  'video',
  'audio',
];

/** `digitalForm` values grouped under the legacy "Media" filter chip (Ảnh/Video/Audio combined). */
export const MEDIA_DIGITAL_FORMS: DigitalForm[] = ['image', 'video', 'audio'];
