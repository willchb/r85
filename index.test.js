const { name } = require('./package');
const assert = require('assert');
const { describe, it } = require('mocha');
const R85 = require('./index');

describe(`${name}/index`, function() {
  const decodedData = new Uint8Array(0x102);

  for (let i = 0; i < decodedData.length; i++) {
    decodedData[i] = i & 0xFF;
  }

  describe('without key', function() {
    const encodedStr = ''
      + '\'K/s!7>k6#G1RO$W$9h%glt+\'"`[D(2SB])BF)!+R9e9,b,LR-rt2k.-hn.0=[UG1MN'
      + '<`2]A#$4m4_<5((FU68p,n7Hch19XVOJ:hI6c;#=r&=30Y?>C#@X?Sk&q@c^b4BsQIMC.'
      + 'E0fD>8l)FN+SBG^s9[HnfusI)Z\\7K9MCPLI@*iMY3f,Oi&MEP$o3^Q4bo!SDUV:TTH=S'
      + 'Ud;$lVt.`/X/"GHY?j-aZO]i$\\_PP=]oC7V^*7sn_:*Z2aJr@KbZe\'dcjXc\'e%LJ@f5'
      + '?1YgE2mqhU%T5jem:Nku`!gl0T]*n@GDCoP:+\\p`-gtqpuM8s"$!';

    describe('binary', function() {
      const encodedData = Buffer.from(encodedStr, 'ascii');
      const r85 = new R85();

      it('encodes data with all possible 1-byte values', function() {
        assert.deepEqual(r85.encode(decodedData), encodedData);
      });

      it('decodes data with all possible 1-byte values', function() {
        assert.deepEqual(r85.decode(encodedData), decodedData);
      });
    });

    describe('string', function() {
      const decodedStr = Buffer.from(decodedData, 'binary');
      const r85 = new R85();

      it('encodes € symbol', function() {
        assert.equal(r85.encodeToString('€'), '3eC3');
      });
      it('decodes € symbol', function() {
        assert.equal(r85.decodeToString('3eC3'), '€');
      });

      it('encodes data with all possible 1-byte values', function() {
        assert.equal(r85.encodeToString(decodedStr), encodedStr);
      });

      it('decodes data with all possible 1-byte values', function() {
        assert.equal(r85.decodeToString(encodedStr), decodedStr);
      });
    });
  });

  describe('with key', function() {
    const encodedStr = ''
      + 'A19R6Jq{](i?+):u:e$-3#^5AUbl}[W7wC0wv065+eneK"K!+Lk^W{aL$paPVlFi?|<jbWC'
      + '\\(:g`g\'jD[[vF]dMKpJ%,$?e;o).m$t],O(Vk@VXPYrqc(s;r7{@/s,S"gwRNt|ca~PT}'
      + 'qd#0v<57wiSRel%pTZRt0&=J1e|cI!tsE8|YXTK)8@|~I:4XSNg"467}Fom__%V7FyO:#o^'
      + 'ab9;9Ui%YrQLB&)C8:=\'IIVC4cJoSEJRp\'mE&WB.ks1"&nAy,Q;,An-!.sTDr?Y3~W`/$'
      + 'F-_DQn`m<{Zb63#P_CEpsi}c4Im5=MbL3^/MZ|dRU:6';

    describe('binary', function() {
      const encodedData = Buffer.from(encodedStr, 'ascii');
      const r85 = new R85('s3cret');

      it('encodes data with all possible 1-byte values', function() {
        assert.deepEqual(r85.encode(decodedData), encodedData);
      });

      it('decodes data with all possible 1-byte values', function() {
        assert.deepEqual(r85.decode(encodedData), decodedData);
      });
    });

    describe('string', function() {
      const decodedStr = Buffer.from(decodedData, 'binary');
      const r85 = new R85('s3cret');

      it('encodes € symbol', function() {
        assert.equal(r85.encodeToString('€'), 'XncX');
      });
      it('decodes € symbol', function() {
        assert.equal(r85.decodeToString('XncX'), '€');
      });

      it('encodes data with all possible 1-byte values', function() {
        assert.equal(r85.encodeToString(decodedStr), encodedStr);
      });

      it('decodes data with all possible 1-byte values', function() {
        assert.equal(r85.decodeToString(encodedStr), decodedStr);
      });
    });
  });

  describe('multiple of 4 number of bytes', function() {
    const decodedData = new Uint8Array(0x100);
    const encodedStr = ''
      + '\'K/s!7>k6#G1RO$W$9h%glt+\'"`[D(2SB])BF)!+R9e9,b,LR-rt2k.-hn.0=[UG1MN'
      + '<`2]A#$4m4_<5((FU68p,n7Hch19XVOJ:hI6c;#=r&=30Y?>C#@X?Sk&q@c^b4BsQIMC.'
      + 'E0fD>8l)FN+SBG^s9[HnfusI)Z\\7K9MCPLI@*iMY3f,Oi&MEP$o3^Q4bo!SDUV:TTH=S'
      + 'Ud;$lVt.`/X/"GHY?j-aZO]i$\\_PP=]oC7V^*7sn_:*Z2aJr@KbZe\'dcjXc\'e%LJ@f5'
      + '?1YgE2mqhU%T5jem:Nku`!gl0T]*n@GDCoP:+\\p`-gtqpuM8s';

    for (let i = 0; i < decodedData.length; i++) {
      decodedData[i] = i & 0xFF;
    }

    describe('binary', function() {
      const encodedData = Buffer.from(encodedStr, 'ascii');
      const r85 = new R85();

      it('encodes data with all possible 1-byte values', function() {
        assert.deepEqual(r85.encode(decodedData), encodedData);
      });

      it('decodes data with all possible 1-byte values', function() {
        assert.deepEqual(r85.decode(encodedData), decodedData);
      });
    });

    describe('string', function() {
      const decodedStr = Buffer.from(decodedData, 'binary');
      const r85 = new R85();

      it('encodes € symbol', function() {
        assert.equal(r85.encodeToString('€'), '3eC3');
      });
      it('decodes € symbol', function() {
        assert.equal(r85.decodeToString('3eC3'), '€');
      });

      it('encodes data with all possible 1-byte values', function() {
        assert.equal(r85.encodeToString(decodedStr), encodedStr);
      });

      it('decodes data with all possible 1-byte values', function() {
        assert.equal(r85.decodeToString(encodedStr), decodedStr);
      });
    });
  });

  describe('1GB of data', function() {
    const decodedData = new Uint8Array(0x4000000);

    for (let i = 0; i < decodedData.length; i++) {
      decodedData[i] = i & 0xFF;
    }

    describe('binary', function() {
      let encodedData;
      const r85 = new R85();

      it('encodes', function() {
        encodedData = r85.encode(decodedData);
      });
      it('decodes', function() {
        r85.decode(encodedData);
      });
    });

    describe('string', function() {
      let encodedStr;
      const decodedStr = Buffer.from(decodedData, 'binary');
      const r85 = new R85();

      it('encodes', function() {
        encodedStr = r85.encodeToString(decodedStr);
      });
      it('decodes', function() {
        r85.decodeToString(encodedStr);
      });
    });
  })
});
