import fs from 'fs-extra';
import { extname } from 'path';

export class IdentityInjector {
  constructor(meValue) {
    this.meValue = meValue;
    this.isImagePath = this.detectImagePath(meValue);
  }

  detectImagePath(value) {
    if (!value) return false;
    
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg'];
    const extension = extname(value.toLowerCase());
    
    return imageExtensions.includes(extension) && fs.pathExistsSync(value);
  }

  injectIdentity(prompt) {
    if (!prompt || !this.meValue || !prompt.includes('[me]')) {
      return { 
        processedPrompt: prompt, 
        wasReplaced: false,
        originalPrompt: prompt
      };
    }

    let replacement;
    if (this.isImagePath) {
      replacement = 'a character based on the uploaded image reference';
    } else {
      replacement = this.meValue;
    }

    const processedPrompt = prompt.replaceAll('[me]', replacement);

    return {
      processedPrompt,
      wasReplaced: true,
      originalPrompt: prompt,
      replacement,
      replacementType: this.isImagePath ? 'image' : 'text'
    };
  }

  getIdentityInfo() {
    if (!this.meValue) {
      return { type: 'none', value: null };
    }

    return {
      type: this.isImagePath ? 'image' : 'text',
      value: this.meValue,
      processed: this.isImagePath ? 'a character based on the uploaded image reference' : this.meValue
    };
  }
}