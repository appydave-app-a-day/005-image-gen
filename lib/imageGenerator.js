import OpenAI from 'openai';
import axios from 'axios';
import fs from 'fs-extra';
import { join, basename } from 'path';

export class ImageGenerator {
  constructor(apiKey, outputDir = './output') {
    this.openai = new OpenAI({ apiKey });
    this.outputDir = outputDir;
    this.retryAttempts = 3;
    this.retryDelay = 2000;
  }

  async generate(promptData, downloadImages = false) {
    const { prompt, style = 'vivid', size = '1024x1024', n = 1, category, filename } = promptData;
    
    const results = [];
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await this.openai.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: size,
          style: style,
          quality: "standard",
        });

        for (let i = 0; i < n; i++) {
          if (i > 0) {
            await this.delay(1000);
          }
          
          const variationResponse = i === 0 ? response : await this.openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: size,
            style: style,
            quality: "standard",
          });

          const imageUrl = variationResponse.data[0].url;
          const revisedPrompt = variationResponse.data[0].revised_prompt;
          
          const result = {
            url: imageUrl,
            revisedPrompt: revisedPrompt,
            variation: i + 1,
          };

          if (downloadImages) {
            try {
              const localPath = await this.downloadImage(imageUrl, prompt, i + 1, category, filename);
              result.localPath = localPath;
            } catch (downloadError) {
              console.warn(`⚠️  Failed to download image: ${downloadError.message}`);
            }
          }

          results.push(result);
        }

        return results;

      } catch (error) {
        if (attempt === this.retryAttempts) {
          throw new Error(`API Error after ${this.retryAttempts} attempts: ${error.message}`);
        }
        
        console.warn(`⚠️  Attempt ${attempt} failed. Retrying in ${this.retryDelay / 1000}s...`);
        await this.delay(this.retryDelay);
      }
    }

    throw new Error('Failed to generate images');
  }

  async downloadImage(url, prompt, variation, category, filename) {
    let outputPath;
    let outputFilename;
    
    if (category && filename) {
      const categoryDir = join(this.outputDir, category);
      await fs.ensureDir(categoryDir);
      
      const timestamp = Date.now();
      outputFilename = variation > 1 
        ? `${filename}-v${variation}-${timestamp}.png`
        : `${filename}-${timestamp}.png`;
      outputPath = join(categoryDir, outputFilename);
    } else {
      await fs.ensureDir(this.outputDir);
      
      const sanitizedPrompt = prompt
        .substring(0, 50)
        .replace(/[^a-z0-9]/gi, '_')
        .replace(/_+/g, '_')
        .toLowerCase();
      
      const timestamp = Date.now();
      outputFilename = `${sanitizedPrompt}_v${variation}_${timestamp}.png`;
      outputPath = join(this.outputDir, outputFilename);
    }

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      timeout: 30000,
    });

    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(outputPath));
      writer.on('error', reject);
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}