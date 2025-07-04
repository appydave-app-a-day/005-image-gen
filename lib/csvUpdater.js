import fs from 'fs-extra';

export class CsvUpdater {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async setActiveFlag(rowIndex, activeValue) {
    try {
      const content = await fs.readFile(this.filePath, 'utf-8');
      const lines = content.split('\n');
      
      if (rowIndex >= lines.length || rowIndex < 1) {
        console.warn(`⚠️  Invalid row index ${rowIndex} for CSV update`);
        return;
      }
      
      const row = lines[rowIndex];
      if (!row || row.trim() === '') {
        console.warn(`⚠️  Empty row at index ${rowIndex}`);
        return;
      }
      
      const columns = this.parseCsvRow(row);
      if (columns.length === 0) {
        console.warn(`⚠️  Could not parse row ${rowIndex}`);
        return;
      }
      
      columns[0] = activeValue.toString();
      
      lines[rowIndex] = this.formatCsvRow(columns);
      
      const updatedContent = lines.join('\n');
      await fs.writeFile(this.filePath, updatedContent, 'utf-8');
      
    } catch (error) {
      console.error(`❌ Failed to update CSV: ${error.message}`);
      throw error;
    }
  }

  parseCsvRow(row) {
    const columns = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < row.length) {
      const char = row[i];
      
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          current += '"';
          i += 2;
          continue;
        }
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        columns.push(current);
        current = '';
      } else {
        current += char;
      }
      i++;
    }
    
    columns.push(current);
    return columns;
  }

  formatCsvRow(columns) {
    return columns.map(col => {
      if (col.includes(',') || col.includes('"') || col.includes('\n')) {
        return `"${col.replace(/"/g, '""')}"`;
      }
      return col;
    }).join(',');
  }
}