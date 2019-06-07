#!/usr/bin/env node

const { EOL } = require('os');

function parseCLIArgs() {
  const isOption = arg => /^-[defokKh]$|^--(?:decode|encode|force|out(?:=.*)?|key(?:=.*)?|help)$/.test(arg);
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const [opt, val] = args[i].split('=');

    switch (opt) {
    case '-h': case '--help':
      options.help = true;
      return options;
    case '-e': case '--encode':
      if (options.method === 'decode') {
        throw 'Please specify either --encode (or -e) or --decode (or -d), not both';
      }
      options.method = 'encode';
      break;
    case '-d': case '--decode':
      if (options.method === 'encode') {
        throw 'Please specify either --encode (or -e) or --decode (or -d), not both';
      }
      options.method = 'decode';
      break;
    case '-f': case '--force':
      options.force = true;
      break;
    case '-o':
      if (options.outFile) {
        throw 'Please specify --out (or -o) only once';
      }
      if (!args[i + 1] || isOption(args[i + 1])) {
        options.outFile = true;
      } else {
        options.outFile = args[++i];
      }
      break;
    case '--out':
      if (options.outFile) {
        throw 'Please specify --out (or -o) only once';
      }
      if (val) {
        options.outFile = val;
      } else {
        options.outFile = true;
      }
      break;
    case '-k':
      if (options.key) {
        throw 'Please specify --key (or -k or -K) only once';
      }
      if (!args[i + 1] || isOption(args[i + 1])) {
        throw 'An encryption key/password is expected after -k';
      }
      options.key = args[++i];
      break;
    case '--key':
      if (options.key) {
        throw 'Please specify --key (or -k or -K) only once';
      }
      if (val) {
        options.key = val;
      } else {
        options.key = true;
      }
      break;
    case '-K':
      if (options.key) {
        throw 'Please specify --key (or -k or -K) only once';
      }
      options.key = true;
      break;
    default:
      if (opt.startsWith('-')) {
        throw `Option ${opt} is invalid`;
      }
      if (options.inFile) {
        throw 'Please specify FILE only once';
      }
      options.inFile = args[i];
      break;
    }
  }
  return options;
}

async function runCLI() {
  try {
    const options = parseCLIArgs();

    if (options.help) {
      process.stdout.write([
        'Usage: r85 [OPTIONS]... [FILE]',
        'Encode or decode FILE or stdin to stdout by default.',
        'Options:',
        '  -d, --decode       decodes FILE (default if file has .r85 extension)',
        `  -e, --encode       encodes FILE (default if file doesn't have .r85 extension)`,
        '  -o, --out=FILE     writes to FILE',
        '  -k, --key=KEY      a key to encrypt/decrypt the data',
        '  -K, --key          same as -k, but read key from stdin',
        '                     and cannot be used together with [FILE]',
        '  -f, --force        overwrites output FILE (--out or -o) if it exists',
        '  -h, --help         print this help',
        '',
        'With no [FILE], reads stdin.',
        'With no [FILE] and with --key (or -K), key is first line from stdin.',
        'With no --out=FILE (or -o FILE), writes to stdout.',
        '',
      ].join(EOL));
    } else {
      let inBuffer;

      options.method = options.method || ((options.inFile || '').toLowerCase().endsWith('.r85') ? 'decode' : 'encode');
      if (options.outFile === true) {
        if (!options.inFile || options.method === 'decode' && !options.inFile.toLowerCase().endsWith('.r85')) {
          throw 'Please specify the output filename with --out=FILE or -o FILE';
        }
        if (options.method === 'encode') {
          options.outFile = `${options.inFile}.r85`;
        } else {
          options.outFile = options.inFile.replace(/[.][Rr]85$/, '');
        }
      }

      const fs = require('fs');
      const checkOutFileAccess = () => new Promise((resolve, reject) => {
        fs.access(options.outFile, fs.constants.F_OK | fs.constants.W_OK, err => {
          if (err && err.code === 'ENOENT') {
            resolve();
          } else if (!options.force) {
            reject('Output FILE exists. Please use --force (or -f) to overwrite.');
          } else if (err) {
            reject(`Permission denied to write output FILE ${options.outFile}`);
          } else {
            resolve();
          }
        });
      });

      if (options.outFile) {
        await checkOutFileAccess();
      }

      if (options.inFile) {
        const checkInFileAccess = () => new Promise((resolve, reject) => {
          fs.access(options.inFile, fs.constants.F_OK | fs.constants.R_OK, err => {
            if (err) {
              if (err.code === 'ENOENT') {
                reject(`Input FILE ${options.inFile} does not exist`);
              } else {
                reject(`Permission denied to read input FILE ${options.inFile}`);
              }
            } else {
              resolve();
            }
          });
        });
        const readInFile = () => new Promise((resolve, reject) => {
          fs.readFile(options.inFile, (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        });

        await checkInFileAccess();
        inBuffer = await readInFile();

        if (options.key === true) {
          const readStdInLine = () => new Promise((resolve, reject) => {
            let key = '';

            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.setEncoding('ascii');
            process.stdin.on('data', char => {
              switch (char) {
              case '\x03':
                process.stdin.pause();
                process.stdin.setRawMode(false);
                reject('Execution aborted by the user');
                return;
              case '\r':
                process.stdin.pause();
                process.stdin.setRawMode(false);
                resolve(key);
                break;
              case '\b':
              case '\x7f':
                key = key.slice(0, -1);
                break;
              default:
                if (char.length === 1 && char >= '\x20' && char < '\x7f') {
                  key += char;
                }
                break;
              }
            });
          });

          options.key = await readStdInLine();
        }
      } else {
        const readStdIn = () => new Promise((resolve, reject) => {
          try {
            const buffers = [];

            process.stdin.resume();
            process.stdin.on('readable', () => {
              for (let chunk = process.stdin.read(); chunk !== null; chunk = process.stdin.read()) {
                buffers.push(chunk);
              }
            });
            process.stdin.on('end', () => {
              resolve(Buffer.concat(buffers));
            });
          } catch (err) {
            reject(err);
          }
        });

        inBuffer = await readStdIn();

        if (options.key === true) {
          const eolIndex = inBuffer.indexOf(EOL);

          if (eolIndex !== -1) {
            options.key = inBuffer.slice(0, eolIndex).toString('ascii');
            inBuffer = inBuffer.slice(eolIndex + EOL.length);
          }
        }
      }

      const R85 = require('../lib');
      const r85 = new R85(options.key || '');

      const outBuffer = r85[options.method](inBuffer);

      if (options.outFile) {
        const writeOutFile = () => new Promise((resolve, reject) => {
          fs.writeFile(options.outFile, outBuffer, err => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });

        await checkOutFileAccess();
        await writeOutFile();
      } else {
        process.stdout.write(outBuffer);
      }
    }
  } catch (err) {
    process.stderr.write([err.message || err, ''].join(EOL));
    process.exitCode = 1;
  }
}

runCLI();
