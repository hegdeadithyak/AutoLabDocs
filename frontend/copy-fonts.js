const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
const publicFontsDir = path.join(__dirname, 'public', 'fonts');
if (!fs.existsSync(publicFontsDir)) {
  fs.mkdirSync(publicFontsDir, { recursive: true });
}

// Copy fonts from source to public
const sourceFontsDir = path.join(__dirname, 'fonts');
if (fs.existsSync(sourceFontsDir)) {
  const fontFiles = fs.readdirSync(sourceFontsDir);
  
  fontFiles.forEach(file => {
    const sourcePath = path.join(sourceFontsDir, file);
    const destPath = path.join(publicFontsDir, file);
    
    // Copy the file
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${sourcePath} to ${destPath}`);
  });
  
  console.log('All fonts copied successfully!');
} else {
  console.log('Source fonts directory not found:', sourceFontsDir);
} 