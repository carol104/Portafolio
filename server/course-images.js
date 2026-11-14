import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {mkdir, writeFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';

export const courseImagesDirectory = process.env.COURSE_IMAGES_DIR || fileURLToPath(new URL('../public/assets/imagenes_cursos/', import.meta.url));
export const courseImagesUrl = '/assets/imagenes_cursos/';
const extensions = {'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp'};

export async function saveCourseImage({bytes, mime, filename, directory = courseImagesDirectory, id = randomUUID()}) {
  if (!extensions[mime]) throw new Error('La imagen del curso debe ser PNG, JPG o WebP.');
  const name = path.parse(path.basename(filename)).name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 70) || 'curso';
  const target = `${name}-${id}${extensions[mime]}`;
  await mkdir(directory, {recursive: true});
  await writeFile(path.join(directory, target), bytes);
  return courseImagesUrl + target;
}
