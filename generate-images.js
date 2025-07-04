#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { FileParser } from './lib/fileParser.js';
import { PromptValidator } from './lib/promptValidator.js';
import { ImageGenerator } from './lib/imageGenerator.js';
import { ResultLogger } from './lib/resultLogger.js';
import { CsvUpdater } from './lib/csvUpdater.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 --input=<filename.csv> [options]')
  .option('input', {
    alias: 'i',
    describe: 'Path to .csv file containing prompts',
    type: 'string',
    demandOption: true,
  })
  .option('style', {
    alias: 's',
    describe: 'Global style override',
    type: 'string',
    choices: ['vivid', 'natural'],
    default: 'vivid',
  })
  .option('size', {
    describe: 'Global size override',
    type: 'string',
    choices: ['1024x1024', '1024x1792', '1792x1024'],
    default: '1024x1024',
  })
  .option('seed', {
    describe: 'Global seed for deterministic results',
    type: 'number',
  })
  .option('n', {
    describe: 'Number of variations per prompt',
    type: 'number',
    default: 1,
  })
  .option('download', {
    alias: 'd',
    describe: 'Download images to output folder',
    type: 'boolean',
    default: false,
  })
  .option('output-dir', {
    alias: 'o',
    describe: 'Directory to save downloaded images',
    type: 'string',
    default: process.env.OUTPUT_DIR || './output',
  })
  .option('api-key', {
    alias: 'k',
    describe: 'OpenAI API key (overrides .env)',
    type: 'string',
  })
  .example('$0 --input=prompts.csv', 'Generate images from CSV file')
  .example('$0 --input=prompts.csv --style=natural --size=1792x1024', 'Generate with overrides')
  .example('$0 --input=prompts.csv --download --output-dir=./my-images', 'Generate and download images')
  .help()
  .alias('help', 'h')
  .argv;

async function main() {
  try {
    const apiKey = argv.apiKey || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ Error: OPENAI_API_KEY not found. Set it in .env file or pass with --api-key');
      process.exit(1);
    }

    console.log('🎨 Starting image generation...\n');

    const fileParser = new FileParser();
    const promptValidator = new PromptValidator();
    const imageGenerator = new ImageGenerator(apiKey, argv.outputDir);
    const resultLogger = new ResultLogger();

    const parseResult = await fileParser.parse(argv.input);
    const prompts = parseResult.prompts;
    const csvUpdater = new CsvUpdater(parseResult.filePath);
    
    if (prompts.length === 0) {
      console.error('❌ No active prompts found in input file (all prompts have a=0)');
      process.exit(1);
    }

    console.log(`📝 Found ${prompts.length} active prompt(s) to process\n`);

    const globalDefaults = {
      style: argv.style,
      size: argv.size,
      seed: argv.seed,
      n: argv.n,
    };

    const results = [];

    for (let i = 0; i < prompts.length; i++) {
      const promptData = { ...globalDefaults, ...prompts[i] };
      
      console.log(`\n[${i + 1}/${prompts.length}] Processing prompt:`);
      console.log(`📝 "${promptData.prompt}"`);
      
      const validation = promptValidator.validate(promptData.prompt);
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => console.log(`⚠️  ${warning}`));
      }

      try {
        const imageResults = await imageGenerator.generate(promptData, argv.download);
        
        results.push({
          index: i + 1,
          rowIndex: promptData.rowIndex,
          prompt: promptData.prompt,
          parameters: {
            style: promptData.style,
            size: promptData.size,
            seed: promptData.seed,
            n: promptData.n,
          },
          results: imageResults,
          timestamp: new Date().toISOString(),
        });

        console.log(`✅ Generated ${imageResults.length} image(s)`);
        imageResults.forEach((result, idx) => {
          console.log(`   ${idx + 1}. ${result.url}`);
          if (result.localPath) {
            console.log(`      📁 Saved to: ${result.localPath}`);
          }
        });

        await csvUpdater.setActiveFlag(promptData.rowIndex, 0);
        console.log(`   🔄 Set active flag to 0 for row ${promptData.rowIndex}`);

      } catch (error) {
        console.error(`❌ Failed to generate image: ${error.message}`);
        results.push({
          index: i + 1,
          rowIndex: promptData.rowIndex,
          prompt: promptData.prompt,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    }

    await resultLogger.save(results);
    
    console.log('\n✨ Image generation complete!');
    console.log(`📊 Results saved to: ${resultLogger.getResultsPath()}`);
    
    const successful = results.filter(r => !r.error).length;
    const failed = results.length - successful;
    
    console.log(`\n📈 Summary: ${successful} successful, ${failed} failed`);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();