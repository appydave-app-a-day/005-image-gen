Perfect. Based on your specifications, here’s a **requirements document** for your CLI-based JavaScript image generation tool using the **OpenAI DALL·E 3 API**, designed with prompt best practices, smart defaults, and flexible parameterization.

---

# 📝 Requirements Document

**Tool Name**: `generate-images-cli`
**Language**: JavaScript (Node.js)
**Purpose**: Command-line tool to batch-generate high-quality images using OpenAI’s image API, with structured prompt input and configurable generation parameters.

---

## 🎯 Primary Function

Generate images using prompts provided in a `.csv` file or `.txt` file, applying optional global overrides (style, size, seed, variations). The tool will follow structured prompt formatting rules for optimal visual quality.

---

## 📁 Input Formats

### 1. `.txt` File

Each line is a standalone prompt (uses global/default parameters unless overridden).

### 2. `.csv` File

CSV with header row. Recognized columns:

| Column   | Required?  | Notes                                       |
| -------- | ---------- | ------------------------------------------- |
| `prompt` | ✅ Yes      | Text prompt to be sent to OpenAI API        |
| `style`  | ❌ Optional | `"vivid"` (default) or `"natural"`          |
| `size`   | ❌ Optional | `"1024x1024"`, `"1024x1792"`, `"1792x1024"` |
| `seed`   | ❌ Optional | Integer seed for deterministic results      |
| `n`      | ❌ Optional | Number of variations (default: `1`)         |

---

## 🧾 Command-Line Interface (CLI)

```
node generate-images.js --input=[filename] [--style=vivid] [--size=1024x1024] [--seed=1234] [--n=2]
```

* **--input**: path to the `.txt` or `.csv` prompt file
* **--style**: global override for all prompts if not defined in file
* **--size**: global size (default: `1024x1024`)
* **--seed**: optional; defaults to system-random
* **--n**: number of variations per prompt (default: 1)

---

## 🖼️ Prompt Engineering Guidelines (Internal Rules)

These should be **applied or validated** by the tool:

* Prompts should follow a **5-part structure**:

  ```
  [Subject] + [Pose/Action] + [Style Keywords] + [Lighting] + [Background]
  ```

  Example:
  `"A cyberpunk fox warrior, crouching on a rooftop, in detailed cel-shading, cinematic lighting, neon city skyline in the background"`

* **Avoid Modifier Overload**: Warn or log if >6 modifiers are detected (e.g., more than 2 adjectives per component or redundant style stacking).

* **Encourage Consistent Subjects**: If batch prompts are themed, suggest enforcing structure for clarity across generations.

---

## 💾 Output

* Image URLs returned from OpenAI will be:

  * Displayed in the console
  * Saved to a `results.json` log
  * Optionally: downloaded as `.png` to `/output` folder (if `--download` flag provided in future)

---

## 🔐 API Setup

* Requires `OPENAI_API_KEY` in `.env` file or passed as CLI flag.

---

## 🔧 Dependencies

* `openai` npm package
* `csv-parser`
* `dotenv`
* `axios` (for optional image downloading)
* `yargs` (for CLI param parsing)
* `fs`, `path` (native)

---

## 🧪 Future Enhancements

* Prompt validation and auto-fixing (e.g. ensuring lighting/background included).
* Support for grouped prompt generation (e.g. 10 variations of same base prompt).
* Negative prompt awareness (simulate via rewording).
* Image outpainting/inpainting (when API allows).

---

Would you like me to scaffold the actual `generate-images.js` file structure next?
