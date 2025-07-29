# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js CLI tool for batch image generation using OpenAI's DALL-E 3 API. It processes prompts from CSV files and generates images with category-based organization.

## Key Commands

### Running the Application
```bash
# Run with default prompts.csv
npm start

# Run with specific CSV file
node generate-images.js input-file.csv

# Run with options
node generate-images.js prompts.csv --seed=42 --variations=3 --dry-run
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
- `prompt`: The image generation prompt
- `category`: Output folder organization
- `active`: true/false to control processing
- `variations`: (optional) Number of variations to generate
- `seed`: (optional) Seed for reproducibility

## Key Implementation Notes

- Uses ES6 modules (`"type": "module"` in package.json)
- All file operations use fs-extra for enhanced functionality
- Image downloads use axios with proper error handling
- Prompts are automatically enhanced with technical specifications for DALL-E 3
- Results include generation metadata (revised prompt, seed, model)