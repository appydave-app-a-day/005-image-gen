Absolutely — here is the **revised and complete Agile-style story card** incorporating your updated identity description and the full `[me]` prompt enhancement logic.

---

## 🧾 User Story Card

**Story ID**: `IMGGEN-IDENTITY-001`
**Title**: Identity Injection via `[me]` Token in Prompts

---

### 🎯 Description

As a user,
I want to define my visual identity using a `--me` flag (either as a text description or image file),
So that prompts containing `[me]` will be dynamically enhanced to reflect that identity,
And future support for image-based referencing can be added without breaking compatibility.

---

### ✅ Acceptance Criteria

* [ ] CLI supports a `--me` flag that accepts:

  * a **text string** (e.g., a structured physical/personality description)
  * or a **path to an image file** (e.g., `./me.png`)
* [ ] Prompts can include the special token `[me]`, which is **replaced at runtime** using the `--me` value.
* [ ] If `--me` is a **text string**, replace `[me]` with the string directly.
* [ ] If `--me` is an **image file**, replace `[me]` with:

  * `"a character based on the uploaded image reference"` (as a placeholder)
  * In future, this will inject actual image reference logic when supported by the API.
* [ ] Identity injection is applied **before** the prompt is sent to the API.
* [ ] If no `[me]` is present in a prompt, the identity is not injected.
* [ ] Identity replacement is logged or previewed in debug mode for transparency.

---

### 🧠 Example Identity Input (Test Case)

```bash
--me="a rugged and intelligent 50-year-old man, silver fox style, with short brown and silver hair, glasses, and an IT professional vibe"
```

---

### 🧪 Prompt Example

#### Before:

```
"A Pixar-style 3D portrait of [me], seated at a rooftop cafe with a laptop, wearing a red hoodie. Expressive lighting, soft shadows, cinematic mood."
```

#### After (Text-Based Identity):

```
"A Pixar-style 3D portrait of a rugged and intelligent 50-year-old man, silver fox style, with short brown and silver hair, glasses, and an IT professional vibe, seated at a rooftop cafe with a laptop, wearing a red hoodie. Expressive lighting, soft shadows, cinematic mood."
```

#### After (Image-Based Identity):

```
"A Pixar-style 3D portrait of a character based on the uploaded image reference, seated at a rooftop cafe with a laptop, wearing a red hoodie. Expressive lighting, soft shadows, cinematic mood."
```

---

### ⚙️ Pseudocode for Identity Injection

```js
function injectIdentity(prompt, meValue) {
  if (!prompt.includes("[me]")) return prompt;

  if (isImagePath(meValue)) {
    return prompt.replaceAll("[me]", "a character based on the uploaded image reference");
  } else {
    return prompt.replaceAll("[me]", meValue);
  }
}
```

---

### 📂 Related Story Cards

| ID                         | Title                                                                     |
| -------------------------- | ------------------------------------------------------------------------- |
| `IMGGEN-CSV-001`           | Identity token injection for prompts in `.csv` files using `{{identity}}` |
| `IMGGEN-PREPROCESS-001`    | Centralized prompt preprocessor pipeline                                  |
| `IMGGEN-IMAGE-UPGRADE-002` | Future support for true image reference upload (OpenAI or other APIs)     |

---

Would you like me to generate an actual `.md` or `.json` story file format for this, or continue drafting other cards like `IMGGEN-CSV-001`?
