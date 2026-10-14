interface BunnyFile {
  Guid: string;
  StorageZoneName: string;
  Path: string;
  ObjectName: string;
  Length: number;
  LastChanged: string;
  IsDirectory: boolean;
  ServerId: number;
  UserId: string;
  ContentType: string;
}

export interface PhotoCollection {
  folder: string;
  title: string;
  images: {
    name: string;
    url: string;
  }[];
}

const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || 'nate-lacroix-photos';
const API_KEY = process.env.BUNNY_API_KEY || '';
const ENDPOINT = process.env.BUNNY_STORAGE_ENDPOINT || 'ny.storage.bunnycdn.com';
const CDN_URL = (process.env.PUBLIC_BUNNY_CDN_URL || 'https://media.natelacroix.com').replace(/\/$/, '');

function formatTitle(name: string) {
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function getBunnyGalleries(): Promise<PhotoCollection[]> {
  if (!API_KEY) {
    console.warn('[Bunny API] Missing BUNNY_API_KEY environment variable. Skipping galleries.');
    return [];
  }

  try {
    const rootUrl = `https://${ENDPOINT}/${STORAGE_ZONE}/galleries/`;
    const res = await fetch(rootUrl, {
      headers: { AccessKey: API_KEY, Accept: 'application/json' },
    });

    if (!res.ok) {
      console.warn(`[Bunny API] Querying ${rootUrl} returned status ${res.status}: ${res.statusText}`);
      return [];
    }

    const items: BunnyFile[] = await res.json();
    const directories = items.filter((item) => item.IsDirectory);
    console.log(`[Bunny API] Found ${directories.length} folder(s) in /galleries/:`, directories.map((d) => d.ObjectName));

    const collections: PhotoCollection[] = [];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

    for (const dir of directories) {
      const folderName = dir.ObjectName;
      const folderUrl = `https://${ENDPOINT}/${STORAGE_ZONE}/galleries/${folderName}/`;

      const folderRes = await fetch(folderUrl, {
        headers: { AccessKey: API_KEY, Accept: 'application/json' },
      });

      if (!folderRes.ok) continue;

      const files: BunnyFile[] = await folderRes.json();
      const images = files
        .filter((f) => !f.IsDirectory && imageExtensions.some((ext) => f.ObjectName.toLowerCase().endsWith(ext)))
        .map((f) => ({
          name: f.ObjectName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          url: `${CDN_URL}/galleries/${folderName}/${f.ObjectName}`,
        }));

      if (images.length > 0) {
        collections.push({
          folder: folderName,
          title: formatTitle(folderName),
          images,
        });
      }
    }

    return collections;
  } catch (err: any) {
    console.error('[Bunny API] Failed to fetch galleries:', err?.message);
    return [];
  }
}
