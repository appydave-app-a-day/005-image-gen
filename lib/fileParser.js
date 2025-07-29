import fs from 'fs-extra';
import csv from 'csv-parser';
import { extname } from 'path';
import { createReadStream } from 'fs';

export class FileParser {
  async parse(filePath) {
    const extension = extname(filePath).toLowerCase();
    
    if (!await fs.pathExists(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    if (extension !== '.csv') {
      throw new Error(`Invalid file type: ${extension}. Only .csv files are supported`);
    }

    return this.parseCsvFile(filePath);
  }

  async parseCsvFile(filePath) {
    const results = [];
    let hasHeaders = false;
    let rowIndex = 0;
    
    return new Promise((resolve, reject) => {
      createReadStream(filePath)
        .pipe(csv())
        .on('headers', (headers) => {
          hasHeaders = true;
          const requiredHeaders = ['a', 'category', 'filename', 'prompt'];
          const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
          
          if (missingHeaders.length > 0) {
            reject(new Error(`Missing required CSV columns: ${missingHeaders.join(', ')}`));
          }
        })
        .on('data', (row) => {
          rowIndex++;
          
          if (!row.prompt || row.prompt.trim() === '') {
            return;
          }
          
          if (!row.category || !row.filename) {
            reject(new Error('Each row must have category and filename values'));
            return;
          }
          
          if (!row.a || !['-1', '0', '1', '9'].includes(row.a)) {
            reject(new Error(`Active flag 'a' must be -1, 0, 1, or 9, got: "${row.a}"`));
            return;
          }
          
          if (row.a !== '1') {
            return;
          }
          
          const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
          if (!kebabCaseRegex.test(row.category)) {
            reject(new Error(`Category "${row.category}" must be lowercase kebab-case (e.g., chibi-capsule)`));
            return;
          }
          
          if (!kebabCaseRegex.test(row.filename)) {
            reject(new Error(`Filename "${row.filename}" must be lowercase kebab-case (e.g., pixar-instagram-scene)`));
            return;
          }
          
          const entry = {
            rowIndex,
            active: true,
            category: row.category,
            filename: row.filename,
            prompt: row.prompt.trim(),
          };
          
          if (row.style && ['vivid', 'natural'].includes(row.style)) {
            entry.style = row.style;
          }
          
          if (row.size && ['1024x1024', '1024x1792', '1792x1024'].includes(row.size)) {
            entry.size = row.size;
          }
          
          if (row.seed && !isNaN(parseInt(row.seed))) {
            entry.seed = parseInt(row.seed);
          }
          
          if (row.n && !isNaN(parseInt(row.n)) && parseInt(row.n) > 0) {
            entry.n = parseInt(row.n);
          }
          
          results.push(entry);
        })
        .on('error', reject)
        .on('end', () => resolve({ prompts: results, filePath }));
    });
  }
}