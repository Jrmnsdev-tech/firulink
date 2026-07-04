const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const outFile = 'firulink-produccion.zip';
if (fs.existsSync(outFile)) fs.unlinkSync(outFile);

const exclude = ['node_modules/*', '.next/*', '.git/*', outFile];
const excludeArgs = exclude.map(e => `-x "${e}"`).join(' ');

try {
  execSync(`zip -r ${outFile} . ${excludeArgs}`, { cwd: __dirname, stdio: 'inherit' });
  console.log(`\n✅ ${outFile} creado correctamente.`);
} catch (err) {
  console.error('Error generando el zip:', err.message);
  process.exit(1);
}
