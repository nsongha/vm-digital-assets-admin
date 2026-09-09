import type { AssetStatus, DigitalForm, ObjectClass, RelationKind } from '../../services/types';

// Shared "physical object" seed shape — one entry per real heritage object
// (CIDOC-CRM E22 Man-Made Object / E27 Site). The generator (assets/generator.ts)
// flat-maps each object's `reps` into one Asset (digital record) per rep,
// which is how one object ends up with several digitalForm rows that all
// share the same tier-1 `physicalObjectId` — the mechanism behind 0ter's
// "hasRepresentation" relation group.

/** Physical-formula parameters for one digital capture — `sizeFormulas.ts` computes `sizeMB` from these, never hand-typed. */
export type RepSize =
  | { kind: 'mesh'; triangleMillions: number; textureRes?: '8K' | '16K' | null }
  | { kind: 'objMesh'; triangleMillions: number; textureRes?: '8K' | '16K' | null }
  | { kind: 'pointcloud'; pointsMillions: number }
  | { kind: 'splat'; gaussiansMillions: number }
  | { kind: 'drawing'; sheets: number }
  | { kind: 'wav'; minutes: number }
  | { kind: 'prores'; minutes: number }
  | { kind: 'tiff'; pages: number; dpi?: 300 | 600 }
  | { kind: 'pdfa'; pages: number }
  | { kind: 'jpegPhoto'; megapixels: number }
  | { kind: 'tiffPhoto'; megapixels: number };

/** One digital record (tier 2) belonging to a physical object. */
export interface DigitalRepSpec {
  digitalForm: DigitalForm;
  fmt: string;
  size: RepSize;
  status: AssetStatus;
  owner: string;
  updated: string;
  /** Appended to the object's `descBase` to form the record's full `desc`. */
  descSuffix: string;
  tags?: string[];
  /** Repeat index for this digitalForm on this object (second scan pass, etc.) — feeds the tier-2 `.DFnn` suffix. Default 1. */
  seq?: number;
}

/** Nhóm quan hệ 2 (0ter) attached at the object level — this object is depicted/mentioned/is the subject of another record (identified by physicalObjectId once generated). */
export interface OutgoingRelation {
  kind: RelationKind;
  targetName: string; // resolved to the target's physicalObjectId by relations.ts after generation
}

export interface PhysicalObjectSeed {
  objectClass: ObjectClass;
  /** Sequence number within this objectClass — feeds tier-1 `VM-<OC>-NNNNN`. Caller-assigned, must be unique per objectClass. */
  seq: number;
  name: string;
  era: string;
  eraEdtf?: string;
  eraCertainty?: 'certain' | 'uncertain' | 'approximate' | 'century' | 'range' | 'unknown';
  loc: string;
  coll: string;
  soKiemKe?: string;
  soDangKy?: string;
  maHoSoDiTich?: string;
  unesco?: boolean;
  descBase: string;
  reps: DigitalRepSpec[];
}
