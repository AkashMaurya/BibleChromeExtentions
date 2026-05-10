const fs = require('fs');
const path = require('path');

// Simple PNG encoder - creates minimal valid PNG files
function createPNG(width, height, color) {
  const canvas = [];

  // PNG signature
  const signature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

  // Helper functions
  function crc32(data) {
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }

    let crc = -1;
    for (let i = 0; i < data.length; i++) {
      crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ -1) >>> 0;
  }

  function chunk(type, data) {
    const typeData = Buffer.from(type, 'ascii');
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([typeData, data])), 0);
    return Buffer.concat([len, typeData, data, crc]);
  }

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type (RGB)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Create image data with gradient
  const rowSize = 1 + width * 3; // filter byte + RGB
  const imageData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    imageData[rowStart] = 0; // filter type: none

    const gradient = y / height;
    const r = Math.round(99 + (139 - 99) * gradient);
    const g = Math.round(102 + (92 - 102) * gradient);
    const b = Math.round(241 + (246 - 241) * gradient);

    for (let x = 0; x < width; x++) {
      const offset = rowStart + 1 + x * 3;
      imageData[offset] = r;
      imageData[offset + 1] = g;
      imageData[offset + 2] = b;
    }
  }

  // Compress image data
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(imageData);

  // IDAT chunk
  const idat = chunk('IDAT', compressed);

  // IEND chunk
  const iend = chunk('IEND', Buffer.alloc(0));

  // Combine all parts
  return Buffer.concat([
    Buffer.from(signature),
    chunk('IHDR', ihdr),
    idat,
    iend
  ]);
}

// Create icons directory
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icons
const sizes = [16, 48, 128];
sizes.forEach(size => {
  const png = createPNG(size, size, null);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), png);
  console.log(`Created icon${size}.png (${size}x${size})`);
});

console.log('All icons generated successfully!');
