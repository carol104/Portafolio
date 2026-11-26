import {build} from 'vite';

// Base64 and JSON add overhead to file uploads. Keep requests below Vercel's
// standard 4.5 MB body limit without requiring a paid/beta configuration.
process.env.VITE_MAX_UPLOAD_BYTES = String(3 * 1024 * 1024);
await build();
