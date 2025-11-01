---
name: map-vs-switch-lookup
description: Use Map for key-value lookups instead of switch statements when mapping values in TypeScript.
---

# Map vs Switch for Lookups

## Rule
Use `Map` for simple value lookups. Use `switch` only for complex logic.

## ✅ Use Map (Simple Lookups)
```typescript
const statusMessages = new Map([
  ["idle", "Ready to start"],
  ["loading", "Processing..."],
  ["success", "Complete!"],
  ["error", "Failed"],
]);

const message = statusMessages.get(status) ?? "Unknown";
```

## ❌ Don't Use Switch (For Lookups)
```typescript
let message: string;
switch (status) {
  case "idle":
    message = "Ready to start";
    break;
  case "loading":
    message = "Processing...";
    break;
  case "success":
    message = "Complete!";
    break;
  case "error":
    message = "Failed";
    break;
  default:
    message = "Unknown";
}
```

## When to Use Map
- ✅ 5+ key-value mappings
- ✅ Dynamic data (can add/remove entries)
- ✅ Need O(1) lookup performance
- ✅ Simple value returns (no complex logic)

## When to Use Switch
- ✅ Complex logic per case
- ✅ Need fall-through behavior
- ✅ < 5 simple cases
- ✅ Type narrowing needed

## Creating Maps from Objects
```typescript
const config = {
  dev: "http://localhost:1420",
  prod: "https://app.example.com",
};

const configMap = new Map(Object.entries(config));
```

## Project Example
[AdvancedSettingsPanel.tsx:88-108](src/app/components/settings/AdvancedSettingsPanel.tsx#L88-L108)
