import fs from 'fs-extra';
import path from 'path';

async function resetActiveFlags() {
  try {
    const csvFile = '/Users/davidcruwys/dev/ad/appydave/appydave-app-a-day/005-image-gen/aitdlr/video-2/prompts.csv';
    const outputDir = '/Users/davidcruwys/dev/ad/appydave/appydave-app-a-day/005-image-gen/aitdlr/video-2';
    
    // Read the current CSV
    const data = await fs.readFile(csvFile, 'utf8');
    const lines = data.split('\n');
    
    // Process each line
    const updatedLines = lines.map((line, index) => {
      if (index === 0) return line; // Skip header
      if (!line.trim()) return line; // Skip empty lines
      
      const columns = line.split(',');
      const filename = columns[2]; // filename is the 3rd column
      
      if (filename) {
        // Extract category from filename (e.g., "1-1-1-..." -> "1-classic-traditional")
        const parts = filename.split('-');
        if (parts.length >= 3) {
          const categoryNum = parts[0];
          const categoryName = columns[1]; // category is the 2nd column
          
          // Check if image file exists
          const imagePath = path.join(outputDir, categoryName);
          
          try {
            const files = fs.readdirSync(imagePath);
            const imageExists = files.some(file => file.includes(filename));
            
            if (imageExists) {
              // Image exists, keep as generated (9)
              columns[0] = '9';
              console.log(`✅ Found: ${filename}`);
            } else {
              // Image doesn't exist, reset to active (1)
              columns[0] = '1';
              console.log(`🔄 Reset: ${filename}`);
            }
          } catch (error) {
            // Directory doesn't exist, reset to active (1)
            columns[0] = '1';
            console.log(`🔄 Reset (no dir): ${filename}`);
          }
        }
      }
      
      return columns.join(',');
    });
    
    // Write the updated CSV
    await fs.writeFile(csvFile, updatedLines.join('\n'));
    console.log('\n✅ Active flags reset successfully!');
    
  } catch (error) {
    console.error('❌ Error resetting flags:', error);
  }
}

// Run the reset
resetActiveFlags();