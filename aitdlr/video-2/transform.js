import fs from 'fs-extra';
import path from 'path';
import csv from 'csv-parser';

// Function to generate filename from prompt (similar to video-1 format)
function generateFilename(prompt, categoryIndex, itemIndex) {
  // Extract key words from prompt, clean and format
  const cleanPrompt = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .substring(0, 50); // Limit length
  
  // Format: category-item-1-description
  return `${categoryIndex}-${itemIndex}-1-${cleanPrompt}`;
}

// Function to add index prefix to folder name
function addIndexPrefix(folderName, index) {
  return `${index}-${folderName}`;
}

async function transformData() {
  try {
    const inputFile = '/Users/davidcruwys/dev/ad/appydave/appydave-app-a-day/005-image-gen/aitdlr/video-2/dzine_prompts_image_and_animation.csv';
    const outputFile = '/Users/davidcruwys/dev/ad/appydave/appydave-app-a-day/005-image-gen/aitdlr/video-2/prompts.csv';
    
    // Parse CSV properly using csv-parser
    const folderGroups = {};
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(inputFile)
        .pipe(csv())
        .on('data', (row) => {
          const { folder_name, image_prompt, dzine_prompt } = row;
          
          if (!folderGroups[folder_name]) {
            folderGroups[folder_name] = [];
          }
          folderGroups[folder_name].push({ 
            imagePrompt: image_prompt, 
            dzinePrompt: dzine_prompt 
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    // Generate output CSV
    const outputLines = ['a,category,filename,prompt,style,size,seed,n'];
    
    let categoryIndex = 1;
    for (const [folderName, items] of Object.entries(folderGroups)) {
      const categoryName = addIndexPrefix(folderName, categoryIndex);
      
      let itemIndex = 1;
      items.forEach(({ imagePrompt, dzinePrompt }) => {
        if (!imagePrompt || !imagePrompt.trim()) return;
        
        // Clean the prompt by removing quotes
        const cleanPrompt = imagePrompt.replace(/^"(.*)"$/, '$1');
        
        // Generate filename
        const filename = generateFilename(cleanPrompt, categoryIndex, itemIndex);
        
        // Create CSV line with properly quoted fields
        const csvLine = [
          '0', // a column (0 for new, as mentioned)
          categoryName,
          filename,
          `"${cleanPrompt}"`, // prompt properly quoted
          'vivid', // default style
          '1024x1024', // default size
          '', // empty seed
          '1' // default n
        ].join(',');
        
        outputLines.push(csvLine);
        itemIndex++;
      });
      
      categoryIndex++;
    }
    
    // Write output file
    await fs.writeFile(outputFile, outputLines.join('\n'));
    
    console.log(`✅ Successfully transformed data into ${outputLines.length - 1} prompts`);
    console.log(`📁 Generated ${Object.keys(folderGroups).length} categories`);
    console.log(`📄 Output saved to: ${outputFile}`);
    
  } catch (error) {
    console.error('❌ Error during transformation:', error);
  }
}

// Run the transformation
transformData();