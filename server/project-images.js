import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {mkdir, writeFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';

export const projectImagesDirectory = process.env.PROJECT_IMAGES_DIR || fileURLToPath(new URL('../public/assets/imagenes_proyectos/', import.meta.url));
export const projectImagesUrl = '/assets/imagenes_proyectos/';
const extensions = {'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp'};

export async function saveProjectImage({bytes, mime, filename, directory = projectImagesDirectory, id = randomUUID()}) {
  if (!extensions[mime]) throw new Error('La captura del proyecto debe ser PNG, JPG o WebP.');
  const name = path.parse(path.basename(filename)).name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 70) || 'proyecto';
  const target = `${name}-${id}${extensions[mime]}`;
  await mkdir(directory, {recursive: true});
  await writeFile(path.join(directory, target), bytes);
  return projectImagesUrl + target;
}
