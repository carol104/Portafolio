import {createApp} from './app.js';

// Schema/data are migrated explicitly before deployment. Cold starts do not
// run content migrations or write files to the read-only deployment directory.
export function createVercelApp({pool, ...options}) {
  return createApp({pool, production: true, serveFrontend: false, trustProxy: 1, mediaStorage: 'database', maxUploadBytes: 3 * 1024 * 1024, ...options});
}
