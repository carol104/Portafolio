import { readFile, mkdir } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { createResume } from '../server/resume.js';

const input = process.argv[2] || 'tmp/pdfs/content.json';
const output = process.argv[3] || 'output/pdf/hoja-de-vida-carol.pdf';
const data = JSON.parse((await readFile(input, 'utf8')).replace(/^\uFEFF/, ''));
await mkdir('output/pdf', { recursive: true });
await pipeline(createResume(data), createWriteStream(output));
console.log(output);
