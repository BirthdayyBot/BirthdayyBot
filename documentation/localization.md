# Localization (i18n) approach

BirthdayyBot uses `@sapphire/plugin-i18next` for localization. This document defines the **single, congruent way** to add and consume translations across the codebase.

## Source of truth

- **`en-US` is the source of truth** for translation keys and shapes.
- Other locales may lag, but keys should be kept compatible.

## Key convention (required)

Use **namespace + colon + flat key**:

- **Format**: `"<namespace>:<flatKey>"`
- **Examples**:
    - `commands/birthday:setSuccess`
    - `commands/config:viewEmbedTitle`
    - `globals:unset`

Rules:

- **No dotted/nested key paths** in code (e.g. avoid `commands/birthday:list.embedList.title`).
- **Flat keys only** within a namespace. If you need grouping, encode it in the flat key name:
    - ✅ `commands/birthday:listEmbedTitle`
    - ❌ `commands/birthday:list.embedList.title`

## Translation file layout

Translations live in `src/languages/<locale>/…` and are grouped by namespace (file path).

Common namespaces:

- `globals` → `src/languages/<locale>/globals.json`
- `commands/birthday` → `src/languages/<locale>/commands/birthday.json`
- `commands/config` → `src/languages/<locale>/commands/config.json`

## String vs structured translations

### Strings (most keys)

- Keep translations as **strings**.
- Interpolate variables with i18next syntax: `{{ variable }}`.

### Structured values (arrays/objects) are allowed, but only behind a flat key

Some callsites intentionally use `returnObjects: true` to fetch arrays/objects (e.g. embed definitions, field arrays, option metadata).

This is valid **as long as the key remains flat**:

- ✅ `commands/config:listEmbed` → value is an embed-shaped object (used with `returnObjects: true`)
- ✅ `commands/config:resetOptionsKey` → value is `{ name, description }` (used with `applyLocalizedBuilder`)
- ❌ `commands/config:list.embedList` → dotted key path

## Which i18n API to use (golden path)

### Interaction contexts (commands, interaction handlers)

Use `resolveKey(interaction, 'namespace:key', options)` when you want a localized **string** using the interaction’s locale resolution:

- Examples: command replies, error messages, button labels if computed in an interaction flow.

### Non-interaction contexts (guild managers, scheduled tasks, background logic)

Use `fetchT(contextOrGuild)` to get a `t` function, then call `t('namespace:key', options)`:

- Examples: managers that build embeds from a `Guild`, scheduled tasks that send messages for a guild.

Avoid `container.i18n.getT(...)` unless you intentionally want to bypass `fetchLanguage` and/or locale resolution.

## Emoji / tokens

Prefer **default variables** (configured in `src/config.ts`) instead of hardcoding emoji characters in translation strings.

- ✅ `{{SUCCESS}}`, `{{FAILURE}}`, `{{INFO}}`, `{{ARROW_RIGHT}}`, …
- ❌ literal emoji like `💡` in translation strings

## Formatting rules

- Keep **Discord formatting decisions** in code where possible (e.g. `bold(...)`), and keep translations “content-first”.
- Use markdown in translations only when it is semantically part of the message (e.g. links, emphasized phrases).

## Checklist for adding/altering translations

- Add/update the key in **`src/languages/en-US/...`** first.
- Ensure the key follows **`namespace:flatKey`**.
- If the value is an object/array, ensure the callsite uses **`returnObjects: true`** and the key is still flat.
- Use `{{ ... }}` interpolation and prefer default variables for common tokens/emojis.
