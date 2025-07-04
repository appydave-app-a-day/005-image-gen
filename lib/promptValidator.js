export class PromptValidator {
  constructor() {
    this.promptComponents = {
      subject: /^[A-Z][^,]+/,
      poseAction: /(standing|sitting|running|flying|jumping|crouching|walking|floating|dancing|posing)/i,
      styleKeywords: /(digital art|oil painting|watercolor|cel-shading|photorealistic|anime|cartoon|sketch|3D render|pixel art)/i,
      lighting: /(lighting|illuminated|backlit|shadow|glow|ambient|dramatic|soft|harsh|neon)/i,
      background: /(background|backdrop|setting|environment|scene)/i,
    };
    
    this.styleModifiers = [
      'detailed', 'cinematic', 'epic', 'realistic', 'stylized', 'minimalist',
      'abstract', 'surreal', 'vintage', 'modern', 'futuristic', 'fantasy',
      'dark', 'bright', 'colorful', 'monochrome', 'vibrant', 'muted'
    ];
  }

  validate(prompt) {
    const warnings = [];
    const suggestions = [];
    
    const modifierCount = this.countModifiers(prompt);
    if (modifierCount > 6) {
      warnings.push(`Too many modifiers (${modifierCount} found). Consider simplifying for better results.`);
    }
    
    if (!this.promptComponents.lighting.test(prompt)) {
      suggestions.push('Consider adding lighting description (e.g., "dramatic lighting", "soft ambient light")');
    }
    
    if (!this.promptComponents.background.test(prompt)) {
      suggestions.push('Consider adding background/setting details');
    }
    
    if (!this.promptComponents.styleKeywords.test(prompt)) {
      suggestions.push('Consider specifying an art style (e.g., "digital art", "oil painting")');
    }
    
    const structure = this.analyzeStructure(prompt);
    
    return {
      valid: true,
      warnings,
      suggestions,
      structure,
      modifierCount
    };
  }

  countModifiers(prompt) {
    const words = prompt.toLowerCase().split(/\s+/);
    let count = 0;
    
    words.forEach(word => {
      if (this.styleModifiers.includes(word) || word.endsWith('ly') || word.endsWith('ish')) {
        count++;
      }
    });
    
    const adjectives = prompt.match(/\b(very|extremely|highly|ultra|super|mega)\b/gi);
    if (adjectives) {
      count += adjectives.length;
    }
    
    return count;
  }

  analyzeStructure(prompt) {
    const components = {
      hasSubject: !!prompt.match(/^[A-Z][^,]+/),
      hasPoseAction: this.promptComponents.poseAction.test(prompt),
      hasStyle: this.promptComponents.styleKeywords.test(prompt),
      hasLighting: this.promptComponents.lighting.test(prompt),
      hasBackground: this.promptComponents.background.test(prompt),
    };
    
    const score = Object.values(components).filter(v => v).length;
    components.structureScore = `${score}/5`;
    
    return components;
  }

  suggestImprovement(prompt) {
    const validation = this.validate(prompt);
    
    if (validation.suggestions.length === 0 && validation.warnings.length === 0) {
      return prompt;
    }
    
    let improvedPrompt = prompt;
    
    if (!validation.structure.hasLighting) {
      improvedPrompt += ', cinematic lighting';
    }
    
    if (!validation.structure.hasBackground) {
      improvedPrompt += ', detailed background';
    }
    
    return improvedPrompt;
  }
}