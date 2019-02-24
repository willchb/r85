const _private = new WeakMap();

class R85 {
  constructor(key) {
    const _this = {
      chars: new Uint8Array(0x5E),
      pow85: new Uint32Array([ 0x1, 0x55, 0x1C39, 0x95EED, 0x31C84B1 ]),
      revLook: { },
    };
    for (let i = 0; i < 0x5E; i++) {
      _this.chars[i] = i + 0x21;
      _this.revLook[i + 0x21] = i;
    }
    if (key) {
      const chars = _this.chars;
      const phrase = new Uint8Array(Math.min(key.length, 0x55));
      for (let i = 0, len = phrase.length; i < len; i++) {
        phrase[i] = key.charCodeAt(i);
      }
      _this.chars = new Uint8Array(0x55);
      for (let i = 0; i < 0x55; i++) {
        const k = phrase[i % phrase.length] % (0x5E - i);
        _this.chars[i] = chars[k];
        _this.revLook[chars[k]] = i;
        chars.copyWithin(k, k + 1, 0x5E - i);
      }
    }
    _private.set(this, _this);
  }
  decode(input) {
    input = input.buffer && input || Buffer.from(input, 'ascii');
    const { pow85, revLook } = _private.get(this);
    let i = 0, j = 0, k = 0, v = 0, len;
    const trLen = input.length % 5;
    const exLen = input.length - trLen;
    const output = Buffer.allocUnsafe(exLen / 5 * 4 + (trLen ? trLen - 1 : 0));
    while (i < input.length) {
      len = i >= exLen ? trLen : 5;
      v = 0;
      for (k = 0; k < len; k++) {
        v += revLook[input[i++]] * pow85[k];
      }
      for (k = 0; k < len - 1; k++) {
        output[j++] = v >> (k << 3) & 0xFF;
      }
    }
    return output;
  }
  encode(input) {
    input = input.buffer && input || Buffer.from(input, 'utf8');
    const { chars, pow85 } = _private.get(this);
    let i = 0, j = 0, k = 0, v = 0, len;
    const trLen = input.length % 4;
    const exLen = input.length - trLen;
    const output = Buffer.allocUnsafe(exLen / 4 * 5 + (trLen ? trLen + 1 : 0));
    while (i < input.length) {
      len = i >= exLen ? trLen : 4;
      v = 0;
      for (k = 0; k < len; k++) {
        v |= input[i++] << (k << 3);
      }
      if (v < 0) {
        v += 0x100000000;
      }
      for (k = 0; k < len + 1; k++) {
        output[j++] = chars[v / pow85[k] % 0x55 | 0];
      }
    }
    return output;
  }
  decodeToString(input) {
    return this.decode(input).toString('utf8');
  }
  encodeToString(input) {
    return this.encode(input).toString('ascii');
  }
}

module.exports = R85;
