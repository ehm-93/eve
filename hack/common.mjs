import path from 'node:path';
import url from 'node:url';

export const hackDir = url.fileURLToPath(new URL('.', import.meta.url));
export const workspaceDir = path.join(hackDir, '..');
export const dataDir = path.join(workspaceDir, 'data');
