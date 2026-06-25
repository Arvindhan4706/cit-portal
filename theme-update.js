const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function replaceInFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Colors
  content = content.replace(/cyan-/g, 'blue-');
  content = content.replace(/purple-/g, 'sky-');
  
  // Hex RGB values for shadows/glows
  content = content.replace(/rgba\(6,182,212/g, 'rgba(59,130,246'); // cyan -> blue
  content = content.replace(/rgba\(168,85,247/g, 'rgba(14,165,233'); // purple -> sky

  // Background shifts
  content = content.replace(/from-slate-900 via-\[#050505\] to-black/g, 'from-slate-950 via-slate-900 to-slate-950');
  content = content.replace(/bg-\[#050505\]/g, 'bg-slate-950');
  
  // Some other deep black overrides
  content = content.replace(/bg-\[#0a0a0a\]/g, 'bg-slate-900');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

walkDir(path.join(__dirname, 'frontend', 'src'), replaceInFile);
console.log('Theme update complete!');
