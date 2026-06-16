// Génère les icônes du site à partir de public/brand/logo.png
// (favicon PNG haute déf + apple-touch). Lancé manuellement, pas au build.
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "public", "brand", "logo.png");

const targets = [
  { out: path.join(root, "app", "icon.png"), size: 256 },
  { out: path.join(root, "app", "apple-icon.png"), size: 180 },
];

for (const { out, size } of targets) {
  await sharp(src)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(out);
  console.log(`✓ ${path.relative(root, out)} (${size}px)`);
}
