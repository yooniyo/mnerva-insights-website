# mnerva editor

Run from the repository root with `node editor/server.js`. Open `http://127.0.0.1:3100/admin`.

This is a working editor with a Node.js backend and no extra dependencies. The backend writes drafts to `editor-data/draft.json` and keeps the 30 previous saved drafts in `editor-data/revisions/`. Saving never changes the public Netlify website or the source pages in `*Main/`.

Select any rendered element to edit it. Select parent or use the element menu to reach a container, section, header, or footer. Edit text, links, fonts, colors, uploaded image backgrounds, spacing, and layouts. Move elements using Move up/down, Move before/inside, or drag the section list. Add, duplicate, and delete elements. Undo and redo are available before leaving the editor.

Font upload supports WOFF2, WOFF, TTF, and OTF; assign a name and apply it to an element or site-wide headings/body text. Font availability from system choices depends on the viewing device; uploaded fonts are embedded in exports. Image uploads support JPG, PNG, WebP, GIF, and AVIF. Files stay in the draft and exports as data URLs.

Use **Export website** to download a complete ZIP of pages, CSS, and scripts. Existing images and uploaded fonts/images are embedded. Exporting does not publish; replace the static site files only after reviewing the export. Use **Download draft backup** and **Restore draft** for portable editor backups.

The in-conversation editor uses the same editing code, but **Save draft** stores in browser storage, not the backend. Browser storage may be unavailable or cleared; download a JSON backup to keep edits outside that preview.

For remote access set `MNERVA_EDITOR_HOST`, `MNERVA_EDITOR_PASSWORD`, and optionally `MNERVA_EDITOR_USER` (default `mnerva`). Host behind HTTPS and configure `MNERVA_EDITOR_DATA` to a persistent private directory. Without a password the server refuses to bind to a non-loopback address. Netlify's existing static hosting cannot run this Node server: remote editor hosting still needs to be arranged. The public holding page remains unchanged.

Preview widths and CSS editing provide control within normal responsive document flow. Arbitrary element reparenting may change its appearance due to inherited CSS; Undo restores it. This is not a pixel-positioned freeform canvas.
