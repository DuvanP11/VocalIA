const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.allocUnsafe(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.allocUnsafe(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crcBuf]);
}

function makePNG(size) {
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);

  // IHDR
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8]=8; ihdr[9]=2; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0;

  // Raw image: draw gradient background + mic icon text using simple approach
  const stride = size * 3 + 1;
  const raw = Buffer.allocUnsafe(stride * size);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0; // filter none
    for (let x = 0; x < size; x++) {
      const t = Math.sqrt(((x - size/2)**2 + (y - size/2)**2)) / (size/2);
      // Gradient: center violet #a855f7 → edge #1e1b4b
      const r = Math.round(168 * (1-t) + 30 * t);
      const g = Math.round(85  * (1-t) + 27 * t);
      const b = Math.round(247 * (1-t) + 75 * t);
      const i = y * stride + 1 + x * 3;
      raw[i] = Math.min(255, r);
      raw[i+1] = Math.min(255, g);
      raw[i+2] = Math.min(255, b);
    }
  }

  // Draw a simple mic shape (white rectangle + circle)
  const cx = Math.floor(size / 2);
  const micW = Math.floor(size * 0.18);
  const micH = Math.floor(size * 0.3);
  const micTop = Math.floor(size * 0.18);
  const micR = Math.floor(micW / 2);

  // Mic body rectangle
  for (let y = micTop + micR; y < micTop + micH; y++) {
    for (let x = cx - micW/2; x < cx + micW/2; x++) {
      const xi = Math.floor(x); if (xi < 0 || xi >= size) continue;
      const i = y * stride + 1 + xi * 3;
      raw[i] = 255; raw[i+1] = 255; raw[i+2] = 255;
    }
  }
  // Mic body top half-circle
  for (let y = micTop; y < micTop + micR; y++) {
    for (let x = cx - micW/2; x < cx + micW/2; x++) {
      const xi = Math.floor(x); if (xi < 0 || xi >= size) continue;
      const dist = Math.sqrt((xi - cx)**2 + (y - (micTop + micR))**2);
      if (dist <= micR) {
        const i = y * stride + 1 + xi * 3;
        raw[i] = 255; raw[i+1] = 255; raw[i+2] = 255;
      }
    }
  }
  // Mic arc / stand
  const arcR = Math.floor(size * 0.22);
  const arcCy = micTop + micH - micR;
  for (let angle = Math.PI; angle <= 2*Math.PI; angle += 0.02) {
    const ax = Math.round(cx + arcR * Math.cos(angle));
    const ay = Math.round(arcCy + arcR * Math.sin(angle));
    for (let dr = -2; dr <= 2; dr++) {
      const px = ax + dr; if (px < 0 || px >= size) continue;
      if (ay < 0 || ay >= size) continue;
      const i = ay * stride + 1 + px * 3;
      raw[i] = 255; raw[i+1] = 255; raw[i+2] = 255;
    }
  }
  // Stand vertical line
  const lineX = cx;
  const lineTop = arcCy + arcR;
  const lineBot = lineTop + Math.floor(size * 0.1);
  for (let y = lineTop; y < lineBot && y < size; y++) {
    for (let dx = -2; dx <= 2; dx++) {
      const px = lineX + dx; if (px < 0 || px >= size) continue;
      const i = y * stride + 1 + px * 3;
      raw[i] = 255; raw[i+1] = 255; raw[i+2] = 255;
    }
  }
  // Stand base
  const baseW = Math.floor(size * 0.2);
  for (let dx = -baseW/2; dx <= baseW/2; dx++) {
    const px = cx + Math.floor(dx); if (px < 0 || px >= size) continue;
    for (let dy = -3; dy <= 3; dy++) {
      const py = lineBot + dy; if (py < 0 || py >= size) continue;
      const i = py * stride + 1 + px * 3;
      raw[i] = 255; raw[i+1] = 255; raw[i+2] = 255;
    }
  }

  const idat = zlib.deflateSync(raw, { level: 6 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

const outDir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'icon-192.png'), makePNG(192));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), makePNG(512));
console.log('Icons created: icon-192.png + icon-512.png');
