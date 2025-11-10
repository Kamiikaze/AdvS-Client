import * as fs from 'fs';
import Path from 'path';
import https from 'https';
import http from 'http';
import { URL } from 'url';

export default async function downStream(
  downloadUrl: string,
  headers: Record<string, string>,
  folderPath: string,
  fileName?: string,
): Promise<{ name: string; size: number; type: string } | null> {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(downloadUrl);
      const protocol = urlObj.protocol === 'https:' ? https : http;

      const options = { headers };

      const req = protocol.get(urlObj, options, async (res) => {
        // handle redirect
        if ([301, 302, 303, 307, 308].includes(res.statusCode || 0)) {
          if (res.headers.location) {
            req.destroy();
            await downStream(
              res.headers.location,
              headers,
              folderPath,
              fileName,
            ).then(resolve);
            return;
          }
        }

        if (res.statusCode && res.statusCode >= 400) {
          console.error('HTTP Error:', res.statusCode);
          resolve(null);
          return;
        }

        // use filename from Content-Disposition header or fallback to URL path
        let outFileName = Path.basename(urlObj.pathname);

        if (fileName) {
          outFileName = fileName;
        } else {
          const cd = res.headers['content-disposition'];
          if (cd) {
            const match = /filename="?([^"]+)"?/.exec(cd);
            if (match) [, outFileName] = match;
          }
        }

        const fullPath = Path.join(folderPath, outFileName);
        const file = fs.createWriteStream(fullPath);

        res.pipe(file);

        file.on('close', () => {
          resolve({
            size: parseInt(res.headers['content-length'] || '0', 10),
            name: outFileName,
            type: res.headers['content-type'] || '',
          });
        });
      });

      req.on('error', (err) => {
        console.error('Download error:', err);
        resolve(null);
      });
    } catch (err) {
      console.error('Exception:', err);
      resolve(null);
    }
  });
}
