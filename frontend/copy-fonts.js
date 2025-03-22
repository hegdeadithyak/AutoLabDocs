const fs = require('fs');
const path = require('path');

// Log for debugging
console.log('Starting font copy process');
console.log('Current working directory:', process.cwd());

// Create multiple possible font directories to ensure fonts are available in all Vercel environments
const targetDirs = [
  path.join(__dirname, 'public', 'fonts'),
  path.join(__dirname, '.next', 'fonts'),
  path.join(__dirname, '.next', 'public', 'fonts'),
  path.join(__dirname, '.vercel', 'output', 'static', 'fonts')
];

// Create all directories
targetDirs.forEach(dir => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    } else {
      console.log(`Directory already exists: ${dir}`);
    }
  } catch (err) {
    console.error(`Error creating directory ${dir}:`, err);
  }
});

// Copy fonts from source to all target directories
const sourceFontsDir = path.join(__dirname, 'fonts');
if (fs.existsSync(sourceFontsDir)) {
  console.log('Source fonts directory found:', sourceFontsDir);
  const fontFiles = fs.readdirSync(sourceFontsDir);
  console.log(`Found ${fontFiles.length} font files:`, fontFiles);
  
  // Copy each font file to each target directory
  fontFiles.forEach(file => {
    const sourcePath = path.join(sourceFontsDir, file);
    
    targetDirs.forEach(targetDir => {
      try {
        const destPath = path.join(targetDir, file);
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied ${sourcePath} to ${destPath}`);
      } catch (err) {
        console.error(`Error copying to ${targetDir}:`, err);
      }
    });
  });
  
  console.log('All fonts copied successfully!');
} else {
  console.log('Source fonts directory not found:', sourceFontsDir);
  // Try to create a sample font directory for debugging
  try {
    fs.mkdirSync(sourceFontsDir, { recursive: true });
    console.log(`Created sample fonts directory: ${sourceFontsDir}`);
  } catch (err) {
    console.error(`Error creating sample directory:`, err);
  }
} 