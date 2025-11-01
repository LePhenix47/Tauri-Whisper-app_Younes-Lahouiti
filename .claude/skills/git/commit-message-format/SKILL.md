---
name: git-commit-message-format
description: Use conventional commit format - type(scope): subject with bullet points and Claude Code signature.
---

# Git Commit Message Format

## Template
```
<type>(<scope>): <short summary>

- Bullet point 1
- Bullet point 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting, no code change
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance/config

## Examples

### Feature
```
feat(transcription): add Vulkan GPU acceleration support

- Enable whisper-rs Vulkan feature
- Add GPU detection and fallback
- Update settings UI for GPU toggle

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Fix
```
fix(fe): resolve TypeScript errors in AdvancedSettingsPanel

- Add type guards for SamplingStrategy union
- Use type assertions for Greedy/BeamSearch
- Remove unused imports

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Refactor
```
refactor(fe): improve Zustand store patterns

- Separate actions into actions object
- Add partialize for persistence
- Create custom selector hooks

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Scope
Common scopes: `fe`, `be`, `ci`, `skills`, `docs`
