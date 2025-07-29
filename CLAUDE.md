# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js CLI tool for batch image generation using OpenAI's DALL-E 3 API. It processes prompts from CSV files and generates images with category-based organization.

## Key Commands

### Running the Application
```bash
# Run with CSV file (required)
node generate-images.js --input=prompts.csv

# Run with download and custom output directory
node generate-images.js --input=prompts.csv --download --output-dir=./my-images

# Run with global overrides
node generate-images.js --input=prompts.csv --style=natural --size=1792x1024 --seed=42 --n=2

# Run with identity injection
node generate-images.js --input=prompts.csv --me="rugged 50-year-old IT professional"
```

### Development Commands
- **Install dependencies**: `npm install` or `pnpm install`
- **Run the generator**: `npm start` or `node generate-images.js`
- **No test suite**: Tests are not implemented yet
- **No linting**: No linting tools are configured

## Architecture Overview

The application follows a modular architecture with clear separation of concerns:

```
generate-images.js         # CLI entry point using yargs
lib/
├── fileParser.js         # CSV parsing and validation
├── identityInjector.js   # Handles [me] token replacement
├── promptValidator.js    # Validates 5-part prompt structure
├── imageGenerator.js     # OpenAI API integration
├── csvUpdater.js        # Updates CSV active flags
└── resultLogger.js      # JSON results logging
```

### Core Workflow
1. **Parse CSV** with prompts (fileParser.js)
2. **Inject identity** tokens if present (identityInjector.js)
3. **Validate prompts** for 5-part structure (promptValidator.js)
4. **Generate images** via DALL-E 3 (imageGenerator.js)
5. **Update CSV** active flags (csvUpdater.js)
6. **Log results** to results.json (resultLogger.js)

### Important Design Patterns
- **Identity Injection**: Replace `[me]` tokens with user's identity from identity.txt
- **5-Part Prompt Structure**: Prompts should follow: Subject | Style | Composition | Color | Mood
- **Automatic Retries**: Built-in retry logic for API failures (3 attempts)
- **Category Organization**: Images saved to output/{category}/{filename}
- **Session Tracking**: Each run gets a unique session ID in results.json

## Environment Setup

Required environment variable in `.env`:
```
OPENAI_API_KEY=your-api-key-here
```

## CSV File Format

The input CSV must have these columns:
- `a`: Active flag (-1=archived, 0=inactive, 1=active, 9=processed)
- `category`: Output folder organization (e.g., "fantasy-realms", "sci-fi-worlds")  
- `filename`: Base filename for generated images
- `prompt`: The image generation prompt (supports `[me]` token replacement)
- `style`: Image style ("vivid" or "natural")
- `size`: Image dimensions ("1024x1024", "1024x1792", or "1792x1024")
- `seed`: (optional) Numeric seed for reproducibility
- `n`: (optional) Number of variations to generate

## Video Project Structure

For video projects, organize files in the `aitdlr/` directory:
```
aitdlr/
├── video-1/
│   ├── prompts.csv
│   ├── 1-urban-everyday-life/
│   ├── 2-fantasy-realms/
│   └── ...
├── video-2/
│   ├── prompts.csv
│   ├── 1-classic-traditional/
│   └── ...
└── video-3/  # Your new project
    ├── prompts.csv
    └── [generated image folders]
```

## Key Implementation Notes

- Uses ES6 modules (`"type": "module"` in package.json)
- All file operations use fs-extra for enhanced functionality
- Image downloads use axios with proper error handling
- Prompts are automatically enhanced with technical specifications for DALL-E 3
- Results include generation metadata (revised prompt, seed, model)
- Active flag system: -1=archived, 0=inactive, 1=active, 9=processed