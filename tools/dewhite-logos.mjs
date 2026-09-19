import { Jimp } from 'jimp';
import { join } from 'node:path';

const DIR = 'C:/Users/User/Desktop/Лендосыы/Konstantin_landing/assets/img/logos';

const files = [
  'logo-edeltech.jpg',
  'logo-emex.jpg',
  'logo-izdehar.jpg',
  'logo-marsh.jpg',
  'logo-navitas.jpg',
  'logo-negev-gas.jpg',
  'logo-netanya-college.jpg',
  'logo-noga.jpg',
  'logo-sonol.jpg',
  'logo-sp-global.jpg',
  'logo-energy-infra.png',
];

const LOW = 12;   // within this distance of the sampled white -> fully transparent
const HIGH = 46;  // beyond this distance -> fully opaque; feather in between

function dist(r, g, b, br, bg, bb) {
  const dr = r - br, dg = g - bg, db = b - bb;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

for (const name of files) {
  const path = join(DIR, name);
  const img = await Jimp.read(path);
  const { width, height, data } = img.bitmap;

  // Sample background colour from the four corners (a few px in, to dodge
  // JPEG ringing right at the edge).
  const samples = [
    [2, 2], [width - 3, 2], [2, height - 3], [width - 3, height - 3],
  ];
  let br = 0, bg = 0, bb = 0;
  for (const [sx, sy] of samples) {
    const idx = (width * sy + sx) * 4;
    br += data[idx]; bg += data[idx + 1]; bb += data[idx + 2];
  }
  br /= samples.length; bg /= samples.length; bb /= samples.length;

  img.scan(0, 0, width, height, function (x, y, idx) {
    const r = this.bitmap.data[idx];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const d = dist(r, g, b, br, bg, bb);
    let alpha;
    if (d <= LOW) alpha = 0;
    else if (d >= HIGH) alpha = 255;
    else alpha = Math.round(((d - LOW) / (HIGH - LOW)) * 255);
    this.bitmap.data[idx + 3] = alpha;
  });

  const outName = name.replace(/\.jpe?g$/i, '.png').replace(/\.png$/i, '.png');
  const outPath = join(DIR, outName);
  await img.write(outPath);
  console.log(name, '-> bg', Math.round(br), Math.round(bg), Math.round(bb), '->', outName);
}
