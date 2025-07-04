# Generate Images CLI

A powerful command-line tool for batch generating images using OpenAI's DALL-E 3 API with structured prompts and smart defaults.

## Features

- 🎨 Batch image generation from `.csv` files with organized categories
- 🔧 Flexible parameter configuration (style, size, seed, variations)
- 📝 Built-in prompt validation and structure analysis
- 🔄 Automatic retry logic for failed requests
- 💾 Results logging to JSON with session tracking
- 📥 Optional image downloading to category-based folders
- 🎯 Optimized for high-quality prompt engineering

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and add your OpenAI API key:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env` and set your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   ```

## Usage

### Basic Usage

Generate images from a CSV file:
```bash
node generate-images.js --input=examples/prompts.csv
```

Generate images with custom parameters:
```bash
node generate-images.js --input=examples/prompts.csv --style=natural --size=1792x1024
```

### Command Line Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--input` | `-i` | Path to .csv file (required) | - |
| `--style` | `-s` | Image style: `vivid` or `natural` | `vivid` |
| `--size` | | Image dimensions: `1024x1024`, `1024x1792`, `1792x1024` | `1024x1024` |
| `--seed` | | Seed for deterministic results | Random |
| `--n` | | Number of variations per prompt | `1` |
| `--download` | `-d` | Download images to local folder | `false` |
| `--output-dir` | `-o` | Directory for downloaded images | `./output` |
| `--api-key` | `-k` | OpenAI API key (overrides .env) | From .env |

### Input File Format

#### CSV File (.csv)
- **Required columns**: `a`, `category`, `filename`, `prompt`
- Optional columns: `style`, `size`, `seed`, `n`
- `a` (active flag): `1` = process this prompt, `0` = skip this prompt
- `category` and `filename` must be lowercase kebab-case (e.g., `chibi-capsule`, `pixar-instagram-scene`)
- Per-row parameters override global settings
- Images saved to: `./output/<category>/<filename>-<timestamp>.png`
- **Auto-update**: After processing, the active flag is automatically set to `0`

Example:
```csv
a,category,filename,prompt,style,size,seed,n
1,chibi-capsule,chibi-ipad-capsule,"A chibi version inside a gashapon capsule, holding an iPad",vivid,1024x1024,42,1
0,influencer-scenes,pixar-instagram-scene,"A Pixar-style 3D character next to giant smartphone",vivid,1792x1024,,1
1,lego-art,lego-sunset-rooftop,"A Lego character on a rooftop at sunset",vivid,1024x1024,77,2
```

### Active Flag Workflow
1. Set `a=1` for prompts you want to process
2. Run the tool - it processes only active prompts
3. After successful generation, the tool automatically sets `a=0`
4. You can rerun the tool and only newly activated prompts will be processed

## Prompt Engineering Guidelines

The tool validates prompts against a 5-part structure for optimal results:

1. **Subject** - Main focus of the image
2. **Pose/Action** - What the subject is doing
3. **Style Keywords** - Art style (digital art, oil painting, etc.)
4. **Lighting** - Lighting description (dramatic, soft, neon, etc.)
5. **Background** - Setting or environment

### Example Well-Structured Prompt:
```
A cyberpunk fox warrior, crouching on a rooftop, in detailed cel-shading style, neon lighting with dramatic shadows, futuristic city skyline in the background
```

## Output

### Console Output
- Real-time progress updates
- Generated image URLs
- Validation warnings and suggestions
- Summary statistics

### Results File (results.json)
- Session ID and timestamp
- All prompts and parameters used
- Generated image URLs
- Error messages for failed generations
- Revised prompts from OpenAI

### Downloaded Images
When using `--download`, images are saved as:
```
output/<category>/<filename>-<timestamp>.png
output/<category>/<filename>-v<variation>-<timestamp>.png
```

Example structure:
```
output/
├── chibi-capsule/
│   └── chibi-ipad-capsule-1703123456789.png
├── influencer-scenes/
│   └── pixar-instagram-scene-1703123456790.png
└── lego-art/
    ├── lego-me-sunset-rooftop-v1-1703123456791.png
    └── lego-me-sunset-rooftop-v2-1703123456792.png
```

## Examples

### Generate single variations with default settings:
```bash
node generate-images.js --input=examples/prompts.csv
```

### Generate multiple variations with specific style:
```bash
node generate-images.js --input=examples/prompts.csv --n=3 --style=natural
```

### Generate and download images:
```bash
node generate-images.js --input=examples/prompts.csv --download --output-dir=./my-images
```

### Use specific seed for reproducibility:
```bash
node generate-images.js --input=examples/prompts.csv --seed=12345
```

## Error Handling

- Automatic retry (up to 3 attempts) for API failures
- Detailed error logging in results.json
- Graceful handling of rate limits
- Clear error messages for missing API key or invalid inputs

## Tips for Best Results

1. **Be Specific**: Include details about style, lighting, and composition
2. **Avoid Modifier Overload**: Tool warns if using more than 6 modifiers
3. **Use Style Keywords**: Specify art style for consistent results
4. **Include Lighting**: Describe the lighting for better atmosphere
5. **Add Background**: Provide context with background descriptions

## License

ISC License