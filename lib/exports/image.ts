/**
 * Préchargement d'image pour les exports (jsPDF / docx).
 * Convertit une URL distante (drapeau) ou un data-URL (armoiries déposées) en
 * données exploitables : data-URL, octets bruts, format et dimensions naturelles.
 * S'exécute côté client uniquement.
 */
export interface LoadedImage {
  dataUrl: string;
  bytes: Uint8Array;
  format: "PNG" | "JPEG";
  w: number;
  h: number;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

function imageSize(src: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 });
    img.onerror = reject;
    img.src = src;
  });
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] ?? "";
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/** Charge une image (URL ou data-URL) ; renvoie null en cas d'échec (réseau, CORS…). */
export async function fetchImageData(url?: string | null): Promise<LoadedImage | null> {
  if (!url) return null;
  try {
    let dataUrl = url;
    if (!url.startsWith("data:")) {
      const res = await fetch(url);
      const blob = await res.blob();
      dataUrl = await blobToDataUrl(blob);
    }
    const format: "PNG" | "JPEG" = /^data:image\/jpe?g/i.test(dataUrl) ? "JPEG" : "PNG";
    const { w, h } = await imageSize(dataUrl);
    return { dataUrl, bytes: dataUrlToBytes(dataUrl), format, w, h };
  } catch {
    return null;
  }
}
