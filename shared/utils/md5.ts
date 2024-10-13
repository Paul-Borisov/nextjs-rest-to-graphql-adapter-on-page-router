export function md5(input: string): string {
  function rotateLeft(x: number, n: number): number {
    return (x << n) | (x >>> (32 - n));
  }

  function addUnsigned(x: number, y: number): number {
    const x4 = x & 0x40000000;
    const y4 = y & 0x40000000;
    const x8 = x & 0x80000000;
    const y8 = y & 0x80000000;
    const result = (x & 0x3fffffff) + (y & 0x3fffffff);
    if (x4 & y4) {
      return result ^ 0x80000000 ^ x8 ^ y8;
    }
    if (x4 | y4) {
      if (result & 0x40000000) {
        return result ^ 0xc0000000 ^ x8 ^ y8;
      } else {
        return result ^ 0x40000000 ^ x8 ^ y8;
      }
    } else {
      return result ^ x8 ^ y8;
    }
  }

  function f(x: number, y: number, z: number): number {
    return (x & y) | (~x & z);
  }
  function g(x: number, y: number, z: number): number {
    return (x & z) | (y & ~z);
  }
  function h(x: number, y: number, z: number): number {
    return x ^ y ^ z;
  }
  function i(x: number, y: number, z: number): number {
    return y ^ (x | ~z);
  }

  function ff(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function gg(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function hh(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function ii(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function convertToWordArray(input: string): number[] {
    const lWordCount: number[] = [];
    let lMessageLength = input.length;
    let lNumberOfWords = (((lMessageLength + 8) >>> 6) + 1) * 16;
    for (let i = 0; i < lNumberOfWords; i++) {
      lWordCount[i] = 0;
    }
    for (let i = 0; i < lMessageLength; i++) {
      lWordCount[i >> 2] |= (input.charCodeAt(i) & 0xff) << ((i % 4) * 8);
    }
    lWordCount[lMessageLength >> 2] |= 0x80 << ((lMessageLength % 4) * 8);
    lWordCount[lNumberOfWords - 2] = lMessageLength << 3;
    return lWordCount;
  }

  function wordToHex(lValue: number): string {
    let wordToHexValue = "",
      wordToHexValueTemp = "",
      lByte,
      lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValueTemp = "0" + lByte.toString(16);
      wordToHexValue += wordToHexValueTemp.substr(
        wordToHexValueTemp.length - 2,
        2
      );
    }
    return wordToHexValue;
  }

  const x = convertToWordArray(input);
  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  const S11 = 7,
    S12 = 12,
    S13 = 17,
    S14 = 22;
  const S21 = 5,
    S22 = 9,
    S23 = 14,
    S24 = 20;
  const S31 = 4,
    S32 = 11,
    S33 = 16,
    S34 = 23;
  const S41 = 6,
    S42 = 10,
    S43 = 15,
    S44 = 21;

  const k = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a,
    0xa8304613, 0xfd469501, 0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821, 0xf61e2562, 0xc040b340,
    0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8,
    0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70, 0x289b7ec6, 0xeaa127fa,
    0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92,
    0xffeff47d, 0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ];

  for (let i = 0; i < x.length; i += 16) {
    const oldA = a;
    const oldB = b;
    const oldC = c;
    const oldD = d;

    a = ff(a, b, c, d, x[i], S11, k[0]);
    d = ff(d, a, b, c, x[i + 1], S12, k[1]);
    c = ff(c, d, a, b, x[i + 2], S13, k[2]);
    b = ff(b, c, d, a, x[i + 3], S14, k[3]);
    a = ff(a, b, c, d, x[i + 4], S11, k[4]);
    d = ff(d, a, b, c, x[i + 5], S12, k[5]);
    c = ff(c, d, a, b, x[i + 6], S13, k[6]);
    b = ff(b, c, d, a, x[i + 7], S14, k[7]);
    a = ff(a, b, c, d, x[i + 8], S11, k[8]);
    d = ff(d, a, b, c, x[i + 9], S12, k[9]);
    c = ff(c, d, a, b, x[i + 10], S13, k[10]);
    b = ff(b, c, d, a, x[i + 11], S14, k[11]);
    a = ff(a, b, c, d, x[i + 12], S11, k[12]);
    d = ff(d, a, b, c, x[i + 13], S12, k[13]);
    c = ff(c, d, a, b, x[i + 14], S13, k[14]);
    b = ff(b, c, d, a, x[i + 15], S14, k[15]);

    a = gg(a, b, c, d, x[i + 1], S21, k[16]);
    d = gg(d, a, b, c, x[i + 6], S22, k[17]);
    c = gg(c, d, a, b, x[i + 11], S23, k[18]);
    b = gg(b, c, d, a, x[i], S24, k[19]);
    a = gg(a, b, c, d, x[i + 5], S21, k[20]);
    d = gg(d, a, b, c, x[i + 10], S22, k[21]);
    c = gg(c, d, a, b, x[i + 15], S23, k[22]);
    b = gg(b, c, d, a, x[i + 4], S24, k[23]);
    a = gg(a, b, c, d, x[i + 9], S21, k[24]);
    d = gg(d, a, b, c, x[i + 14], S22, k[25]);
    c = gg(c, d, a, b, x[i + 3], S23, k[26]);
    b = gg(b, c, d, a, x[i + 8], S24, k[27]);
    a = gg(a, b, c, d, x[i + 13], S21, k[28]);
    d = gg(d, a, b, c, x[i + 2], S22, k[29]);
    c = gg(c, d, a, b, x[i + 7], S23, k[30]);
    b = gg(b, c, d, a, x[i + 12], S24, k[31]);

    a = hh(a, b, c, d, x[i + 5], S31, k[32]);
    d = hh(d, a, b, c, x[i + 8], S32, k[33]);
    c = hh(c, d, a, b, x[i + 11], S33, k[34]);
    b = hh(b, c, d, a, x[i + 14], S34, k[35]);
    a = hh(a, b, c, d, x[i + 1], S31, k[36]);
    d = hh(d, a, b, c, x[i + 4], S32, k[37]);
    c = hh(c, d, a, b, x[i + 7], S33, k[38]);
    b = hh(b, c, d, a, x[i + 10], S34, k[39]);
    a = hh(a, b, c, d, x[i + 13], S31, k[40]);
    d = hh(d, a, b, c, x[i], S32, k[41]);
    c = hh(c, d, a, b, x[i + 3], S33, k[42]);
    b = hh(b, c, d, a, x[i + 6], S34, k[43]);
    a = hh(a, b, c, d, x[i + 9], S31, k[44]);
    d = hh(d, a, b, c, x[i + 12], S32, k[45]);
    c = hh(c, d, a, b, x[i + 15], S33, k[46]);
    b = hh(b, c, d, a, x[i + 2], S34, k[47]);

    a = ii(a, b, c, d, x[i], S41, k[48]);
    d = ii(d, a, b, c, x[i + 7], S42, k[49]);
    c = ii(c, d, a, b, x[i + 14], S43, k[50]);
    b = ii(b, c, d, a, x[i + 5], S44, k[51]);
    a = ii(a, b, c, d, x[i + 12], S41, k[52]);
    d = ii(d, a, b, c, x[i + 3], S42, k[53]);
    c = ii(c, d, a, b, x[i + 10], S43, k[54]);
    b = ii(b, c, d, a, x[i + 1], S44, k[55]);
    a = ii(a, b, c, d, x[i + 8], S41, k[56]);
    d = ii(d, a, b, c, x[i + 15], S42, k[57]);
    c = ii(c, d, a, b, x[i + 6], S43, k[58]);
    b = ii(b, c, d, a, x[i + 13], S44, k[59]);
    a = ii(a, b, c, d, x[i + 4], S41, k[60]);
    d = ii(d, a, b, c, x[i + 11], S42, k[61]);
    c = ii(c, d, a, b, x[i + 2], S43, k[62]);
    b = ii(b, c, d, a, x[i + 9], S44, k[63]);

    a = addUnsigned(a, oldA);
    b = addUnsigned(b, oldB);
    c = addUnsigned(c, oldC);
    d = addUnsigned(d, oldD);
  }

  return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
}
