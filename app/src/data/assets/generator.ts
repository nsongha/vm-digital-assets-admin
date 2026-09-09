import { digitalRecordCode, physicalObjectId } from '../../utils/assetCode';
import type { Asset } from '../../services/types';
import { UNESCO_MEMORY_OF_WORLD } from '../heritage';
import type { PhysicalObjectSeed, RepSize } from '../objects/types';
import {
  drawingSizeMB,
  formatSizeMB,
  jpegPhotoSizeMB,
  meshSizeMB,
  objMeshSizeMB,
  pdfaSizeMB,
  pointCloudSizeMB,
  proresSizeMB,
  splatSizeMB,
  tiffA4SizeMB,
  tiffPhotoSizeMB,
  wavSizeMB,
} from '../sizeFormulas';

/** Physical formula dispatch — every `sizeMB` in the app traces back to one of these calls. */
function sizeMBFor(size: RepSize): number {
  switch (size.kind) {
    case 'mesh':
      return meshSizeMB(size.triangleMillions, size.textureRes);
    case 'objMesh':
      return objMeshSizeMB(size.triangleMillions, size.textureRes);
    case 'pointcloud':
      return pointCloudSizeMB(size.pointsMillions);
    case 'splat':
      return splatSizeMB(size.gaussiansMillions);
    case 'drawing':
      return drawingSizeMB(size.sheets);
    case 'wav':
      return wavSizeMB(size.minutes);
    case 'prores':
      return proresSizeMB(size.minutes);
    case 'tiff':
      return tiffA4SizeMB(size.pages, size.dpi);
    case 'pdfa':
      return pdfaSizeMB(size.pages);
    case 'jpegPhoto':
      return jpegPhotoSizeMB(size.megapixels);
    case 'tiffPhoto':
      return tiffPhotoSizeMB(size.megapixels);
  }
}

/**
 * Flat-maps physical-object seeds (1 object : N digital reps) into the flat
 * `Asset[]` every service/component reads. Multiple reps of the same object
 * share one `physicalObjectId`/`physicalArtifactId` — the mechanism behind
 * 0ter's "hasRepresentation" relation group. IDs are assigned sequentially
 * within one call so the dataset is deterministic across reloads.
 */
export function generateAssets(seedGroups: PhysicalObjectSeed[][]): Asset[] {
  const out: Asset[] = [];
  let nextId = 1;

  for (const seeds of seedGroups) {
    for (const obj of seeds) {
      const objId = physicalObjectId(obj.objectClass, obj.seq);
      const unesco = Boolean(obj.unesco) || obj.coll === UNESCO_MEMORY_OF_WORLD.collectionName;

      for (const rep of obj.reps) {
        const code = digitalRecordCode(objId, rep.digitalForm, rep.seq ?? 1);
        const mb = sizeMBFor(rep.size);

        out.push({
          id: nextId++,
          code,
          physicalObjectId: objId,
          name: obj.name,
          objectClass: obj.objectClass,
          digitalForm: rep.digitalForm,
          fmt: rep.fmt,
          size: formatSizeMB(mb),
          sizeMB: mb,
          era: obj.era,
          eraEdtf: obj.eraEdtf,
          eraCertainty: obj.eraCertainty,
          loc: obj.loc,
          coll: obj.coll,
          owner: rep.owner,
          updated: rep.updated,
          status: rep.status,
          desc: (obj.descBase + rep.descSuffix).trim(),
          tags: rep.tags ?? [],
          physicalArtifactId: objId,
          unesco,
          soKiemKe: obj.soKiemKe,
          soDangKy: obj.soDangKy,
          maHoSoDiTich: obj.maHoSoDiTich,
        });
      }
    }
  }

  return out;
}
