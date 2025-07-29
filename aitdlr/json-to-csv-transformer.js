#!/usr/bin/env node

import fs from 'fs-extra';
import { join } from 'path';

/**
 * Transforms scene_prompt_data.json to CSV format for image generation
 */
class JsonToCsvTransformer {
  constructor(inputPath, outputPath) {
    this.inputPath = inputPath;
    this.outputPath = outputPath;
  }

  /**
   * Convert chapter name to category slug
   */
  createCategorySlug(chapterName) {
    return chapterName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Convert scene description to filename slug
   */
  createSceneSlug(sceneDescription) {
    let slug = sceneDescription
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Truncate to 30 chars but ensure it doesn't end with a dash
    if (slug.length > 30) {
      slug = slug.substring(0, 30);
      // Remove trailing dash if present
      slug = slug.replace(/-+$/, '');
    }
    
    return slug;
  }

  /**
   * Convert style description to vivid/natural
   */
  convertStyle(styleDescription) {
    const style = styleDescription.toLowerCase();
    
    // Keywords that suggest "natural" style
    const naturalKeywords = ['sepia', 'watercolor', 'soft', 'gentle', 'calm', 'minimalist', 'zen', 'quiet', 'harmony', 'timeless'];
    
    // Check if style contains natural keywords
    const hasNaturalKeywords = naturalKeywords.some(keyword => style.includes(keyword));
    
    return hasNaturalKeywords ? 'natural' : 'vivid';
  }

  /**
   * Transform JSON data to CSV rows
   */
  transformData(jsonData) {
    const csvRows = [];
    
    // Add CSV header
    csvRows.push('a,category,filename,prompt,style,size,seed,n');

    jsonData.forEach((chapter, chapterIndex) => {
      const categorySlug = this.createCategorySlug(chapter.chapter);
      const convertedStyle = this.convertStyle(chapter.style);
      
      chapter.scenes.forEach((scene, sceneIndex) => {
        const sceneSlug = this.createSceneSlug(scene.scene);
        
        // Create two rows: one for prompt1, one for prompt2
        [1, 2].forEach(promptNumber => {
          const promptKey = `prompt${promptNumber}`;
          const filename = `${chapterIndex + 1}-${sceneIndex + 1}-${promptNumber}-${sceneSlug}`;
          
          // CSV row: a,category,filename,prompt,style,size,seed,n
          const csvRow = [
            '1', // active flag
            categorySlug,
            filename,
            `"${scene[promptKey]}"`, // Wrap prompt in quotes
            convertedStyle,
            '1024x1024',
            '', // empty seed
            '1'
          ].join(',');
          
          csvRows.push(csvRow);
        });
      });
    });

    return csvRows;
  }

  /**
   * Main transformation function
   */
  async transform() {
    try {
      console.log('🔄 Reading JSON file...');
      const jsonData = await fs.readJson(this.inputPath);
      
      console.log('🔄 Transforming data...');
      const csvRows = this.transformData(jsonData);
      
      console.log('🔄 Writing CSV file...');
      const csvContent = csvRows.join('\n');
      await fs.writeFile(this.outputPath, csvContent);
      
      console.log(`✅ Successfully transformed ${csvRows.length - 1} rows`);
      console.log(`📁 Output file: ${this.outputPath}`);
      
      // Print summary
      const chapters = jsonData.length;
      const totalScenes = jsonData.reduce((sum, chapter) => sum + chapter.scenes.length, 0);
      const totalPrompts = totalScenes * 2;
      
      console.log('\n📊 Summary:');
      console.log(`   Chapters: ${chapters}`);
      console.log(`   Scenes: ${totalScenes}`);
      console.log(`   Total prompts: ${totalPrompts}`);
      
    } catch (error) {
      console.error('❌ Error during transformation:', error.message);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const inputPath = './video-1/diorama_prompt_data.json';
  const outputPath = './video-1/prompts.csv';
  
  const transformer = new JsonToCsvTransformer(inputPath, outputPath);
  await transformer.transform();
}

main();