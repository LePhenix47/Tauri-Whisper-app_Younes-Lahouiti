# Issue Escalation Template for ChatGPT

If you encounter errors you cannot resolve, 
use the template defined in `.claude/issue-to-chatgpt.md` as a guide, 
and output a filled-in version directly here in chat.  
⚠️ Do not edit or overwrite the `.claude/issue-to-chatgpt.md` file itself.

If there are no errors (or I clearly ran the wrong command by accident), 
instead of doing nothing, reply with either an inspiring or motivating quote 
about coding, creativity, or persistence OR a meme



## 🏗️ What I'm Implementing
_Describe the feature you're working on (e.g., “Adding import aliases to Vite config for cleaner imports”)._

## 🧠 My Approach & Thought Process
_Explain how you expected to implement it, and why (the reasoning/mental model)._

## 🐛 The Bug / Issue
- **Error message(s):** Paste console or TS errors here.
- **Unexpected behavior:** Describe what actually happens.

## 🔁 Attempts Made (Step by Step)
1. Attempt 1 — What I tried, why I thought it might work, what happened.
2. Attempt 2 — Same as above.
3. Attempt 3 — Same as above.

_(Be specific: copy snippets, commands, and exact results.)_

## 💡 Intuitive / Alternative Solutions
_List “gut feeling” fixes, guesses, or potential directions even if they seem half-baked (so ChatGPT can validate or refine them)._

---

### Example

#### 🏗️ What I'm Implementing
I'm trying to add path aliases (`@components`, `@utils`, etc.) to a Vite + React + TS + Tauri project.  

#### 🧠 My Thought Process
I know Vite supports `resolve.alias`, so I tried using Node's `path.resolve` with `__dirname`.  

#### 🐛 The Bug
- TypeScript errors: `Cannot find module 'path'`
- `__dirname` not defined in ESM
- `process.env` also errors

#### 🔁 Attempts Made
1. Imported `path` directly — TS error.  
2. Added `@types/node` — fixed typing, but `__dirname` still invalid.  
3. Tried using `process.env.TAURI_DEBUG` — error, because Vite uses `import.meta.env`.  

#### 💡 Intuitive Solutions
- Use `fileURLToPath(new URL(..., import.meta.url))` instead of `__dirname`.  
- Replace `process.env` with `import.meta.env`.  
- Double-check `tsconfig.json` matches Vite aliases.  
