---
"@content-collections/core": patch
"@content-collections/vite": patch
---

The Vite plugin now uses the Vite dev server's watcher instead of starting its own. The builder exposes `watchPaths()` so integrations with their own watcher can watch the same paths.
