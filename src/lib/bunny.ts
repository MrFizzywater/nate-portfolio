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

const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || 'nate-photo-zone';
const API_KEY = process.env.BUNNY_API_KEY || '';
const ENDPOINT = process.env.BUNNY_STORAGE_ENDPOINT || 'storage.bunnycdn.com';
const CDN_URL = (process.env.PUBLIC_BUNNY_CDN_URL || 'https://media.natelacroix.com').replace(/\/$/, '');

// Format folder names like "huron-county" -> "Huron County"
function formatTitle(name: string) {
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function getBunnyGalleries(): Promise<PhotoCollection[]> {
  if (!API_KEY) {
    console.warn('[Bunny API] No BUNNY_API_KEY found in environment variables.');
    return [];
  }

  try {
    // 1. Fetch root directory of storage zone
    const rootRes = await fetch(`https://${ENDPOINT}/${STORAGE_ZONE}/`, {
      headers: { AccessKey: API_KEY, Accept: 'application/json' },
    });

    if (!rootRes.ok) {
      console.error(`[Bunny API] Error fetching root: ${rootRes.status} ${rootRes.statusText}`);
      return [];
    }

    const rootItems: BunnyFile[] = await rootRes.json();
    const directories = rootItems.filter((item) => item.IsDirectory);

    // 2. Fetch images within each folder
    const collections: PhotoCollection[] = [];

    for (const dir of directories) {
      const folderName = dir.ObjectName;
      const folderRes = await fetch(`https://${ENDPOINT}/${STORAGE_ZONE}/${folderName}/`, {
        headers: { AccessKey: API_KEY, Accept: 'application/json' },
      });

      if (!folderRes.ok) continue;

      const files: BunnyFile[] = await folderRes.json();
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

      const images = files
        .filter((f) => !f.IsDirectory && imageExtensions.some((ext) => f.ObjectName.toLowerCase().endsWith(ext)))
        .map((f) => ({
          name: f.ObjectName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          url: `${CDN_URL}/${folderName}/${f.ObjectName}`,
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
  } catch (error) {
    console.error('[Bunny API] Failed to fetch collections:', error);
    return [];
  }
}
