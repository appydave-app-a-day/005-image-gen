import fs from 'fs-extra';
import { join } from 'path';

export class ResultLogger {
  constructor(resultsPath = './results.json') {
    this.resultsPath = resultsPath;
  }

  async save(results) {
    const logEntry = {
      sessionId: this.generateSessionId(),
      timestamp: new Date().toISOString(),
      totalPrompts: results.length,
      successful: results.filter(r => !r.error).length,
      failed: results.filter(r => r.error).length,
      results: results,
    };

    let existingData = [];
    
    try {
      if (await fs.pathExists(this.resultsPath)) {
        const content = await fs.readFile(this.resultsPath, 'utf-8');
        existingData = JSON.parse(content);
      }
    } catch (error) {
      console.warn('⚠️  Could not read existing results file, creating new one');
    }

    existingData.push(logEntry);

    await fs.writeJson(this.resultsPath, existingData, { spaces: 2 });
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  getResultsPath() {
    return this.resultsPath;
  }

  async getLastSession() {
    try {
      if (await fs.pathExists(this.resultsPath)) {
        const content = await fs.readFile(this.resultsPath, 'utf-8');
        const data = JSON.parse(content);
        return data[data.length - 1] || null;
      }
    } catch (error) {
      console.error('Error reading results:', error);
    }
    return null;
  }

  async clearResults() {
    try {
      await fs.remove(this.resultsPath);
      console.log('Results file cleared');
    } catch (error) {
      console.error('Error clearing results:', error);
    }
  }
}