import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: [
    {
      name: 'local-cms-backend',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/api/save' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
              try {
                const data = JSON.parse(body);
                if (data.contentData) fs.writeFileSync('content/data.json', JSON.stringify(data.contentData, null, 2));
                if (data.imagesData) fs.writeFileSync('content/images.json', JSON.stringify(data.imagesData, null, 2));
                
                if (!fs.existsSync('public/api')) fs.mkdirSync('public/api', { recursive: true });
                if (data.contentData) fs.writeFileSync('public/api/data.json', JSON.stringify(data.contentData, null, 2));
                if (data.imagesData) fs.writeFileSync('public/api/images.json', JSON.stringify(data.imagesData, null, 2));
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));

                // Auto deploy to GitHub and Cloudflare in the background
                const { exec } = require('child_process');
                console.log('Save successful. Triggering auto-deploy to GitHub and Cloudflare...');
                exec('npm run build && git add . && git commit -m "Auto-save from Editor" && git push && npx wrangler pages deploy dist --project-name aru-labs', (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Auto-deploy error: ${error.message}`);
                        return;
                    }
                    console.log(`Auto-deploy success!`);
                });
              } catch (e) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: e.message }));
              }
            });
            return;
          }

          if (req.url === '/api/upload' && req.method === 'POST') {
            // Because base64 strings can be large, we might need a higher limit, but data events handle it.
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
              try {
                const { filename, base64 } = JSON.parse(body);
                const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (!matches || matches.length !== 3) throw new Error('Invalid base64 string');
                
                const buffer = Buffer.from(matches[2], 'base64');
                const dir = path.resolve(__dirname, 'public/assets/images');
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                
                const safeName = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
                const uniqueName = Date.now() + '_' + safeName;
                const filepath = path.join(dir, uniqueName);
                fs.writeFileSync(filepath, buffer);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, path: 'assets/images/' + uniqueName }));
              } catch (e) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: e.message }));
              }
            });
            return;
          }
          next();
        });
      }
    }
  ]
});
