[![npm][npm]][npm-url]
[![node][node]][node-url]
[![license][license]][license-url]

# r85

This is a binary and text encoding with radix-85 representation.

It's like base64, only that it uses 85 symbols rather than 64, which produces
smaller result. This is also different from base64 because it provides encryption.

## It's lightning fast

Check out the time to encode and decode 1GB of data in a Intel Core i7-8750H:

| Format | Encoding | Decoding |
|:-------|---------:|---------:|
| Binary |   1287ms |    516ms |
| String |   1304ms |   1257ms |

## Encoding content

The `encode` method accepts Array, TypedArray, Buffer and String as argument. It
always return a Buffer with the encoded content.

## Decoding content

Similarly, the `decode` method accepts Array, TypedArray, Buffer and String as
argument. It also always return a Buffer with the decoded content.

## Encoding and decoding strings

The special methods `encodeToString` and `decodeToString` also accept Array,
TypedArray, Buffer and String as argument. However they return a String rather
than a Buffer. That might be convenient in some situation.

## Encode/decode binary data without encryption

```js
const fs = require('fs');
const R85 = require('r85');

const r85 = new R85();

const buffer = fs.readFileSync('file.bin');
const encodedBuffer = r85.encode(buffer);
const decodedBuffer = r85.decode(decodedBuffer);

fs.writeFileSync('file.bin.r85', encodedBuffer);

// file.bin.copy has the same content as file.bin
fs.writeFileSync('file.bin.copy', decodedBuffer);

```

```js
const R85 = require('r85');

const r85 = new R85();

const euroSymbolUTF8Bytes = [0xE2, 0x82, 0xAC];
const encodedBuffer = r85.encode(euroSymbolUTF8Bytes);
const encodedArray = Array.from(euroSymbolEncodedBuffer);
const encodedString = String.fromCharCode.apply(null, encodedArray);

// logs [ 51, 101, 67, 51 ]
console.log(encodedArray);

// logs 3eC3
console.log(encodedString);
```

## Encode/decode text without encryption

```js
const R85 = require('r85');

const r85 = new R85();

const euroSymbol = '€'; // this is 2-byte in UCS2 \u20AC
const encodedString = r85.encodeToString(euroSymbol);
const decodedString = r85.decodeToString(encodedString);

// logs 3eC3
console.log(encodedString);

// logs €
console.log(decodedString);
```

## Encode/decode data with encryption

In order to encode data with encryption, or decode previously encryted encoded
data, provide a key as argument to the constructor.


```js
const R85 = require('r85');

const r85 = new R85('s3cret');

const euroSymbol = '€'; // this is 2-byte in UCS2 \u20AC
const encodedString = r85.encodeToString(euroSymbol);
const decodedString = r85.decodeToString(encodedString);

// logs XncX
console.log(encodedString);

// logs €
console.log(decodedString);
```

## Maintainer

| [![willchb-avatar]][willchb] |
|:----------------------------:|
| [Willian Balmant]([willchb]) |


<!-- External references -->
[npm]: https://img.shields.io/npm/v/r85.svg
[npm-url]: https://npmjs.com/package/r85
[node]: https://img.shields.io/node/v/r85.svg
[node-url]: https://nodejs.org
[license]: https://img.shields.io/npm/l/r85.svg
[license-url]: https://github.com/willchb/r85/raw/master/LICENSE.md
[willchb]: https://github.com/willchb
[willchb-avatar]: https://avatars1.githubusercontent.com/u/16672319?v=3&s=150
