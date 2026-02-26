Porting Plan: NextJS UI Proposal → Svelte
Architecture
Framework & Stack:

- Keep WXT + Svelte 5
- Install shadcn-svelte (based on Bits UI + Skeleton)
- Tailwind CSS v4 with custom OKLCH design tokens
- Lucide Svelte for icons
- tw-animate-css for animations
  Key Changes:
- Merge Vault/Current tabs into unified single-flow interface
- Replace zinc theme with custom Excalivault color system
- Replace DaisyUI with shadcn-svelte components

---

Phase 1: Design System Setup

1. Port color system
   - Copy OKLCH tokens from globals.css to src/app.css
   - Setup shadcn-svelte configuration
   - Configure theme provider for CSS variables
2. Typography
   - Add Inter + JetBrains Mono (or use system fallbacks)
   - Define font-family CSS variables
3. Install shadcn-svelte
   - Run: npx shadcn-svelte@latest init
   - Configure path aliases: $lib, $components

---

Phase 2: Base Components (Port from UI Proposal)
Create $lib/components/ui/ equivalents:

1. Button - variants: default, destructive, outline, secondary, ghost, link
2. Input - with focus states, validation
3. Dialog - Root, Content, Header, Footer, Title, Description, Close
4. Label - form labels
5. Badge - status badges
6. Separator - dividers

---

Phase 3: Excalivault Components

1. VaultLogo ($lib/components/excalivault/VaultLogo.svelte)
   - Shield icon with glow effect
   - "EXCALIVAULT" text with primary accent
2. SaveToVault ($lib/components/excalivault/SaveToVault.svelte)
   - Port from save-to-vault.tsx
   - Integrate with existing saveDrawing() store function
   - Add loading states and success feedback
3. VaultList ($lib/components/excalivault/VaultList.svelte)
   - Port from vault-list.tsx
   - Search functionality
   - Thumbnail display (use existing imageBase64)
   - Context menu for actions (Open, Delete)
   - Integrate with drawings store
4. EmptyVault ($lib/components/excalivault/EmptyVault.svelte)
   - Port from empty-vault.tsx
   - Call-to-action to open Excalidraw
5. ConfirmOpen ($lib/components/excalivault/ConfirmOpen.svelte)
   - Port from confirm-open.tsx
   - Warning dialog for overwriting canvas
   - Connect to existing openDrawing() logic
6. DeleteConfirm ($lib/components/excalivault/DeleteConfirm.svelte)
   - Port from delete-confirm.tsx
   - Warning dialog for deletion
   - Connect to existing deleteDrawing() logic
7. FutureFeatures ($lib/components/excalivault/FutureFeatures.svelte)
   - Port from future-features.tsx
   - Roadmap display

---

Phase 4: Popup.svelte Refactor

1. Remove tab-based navigation
2. Implement screen state machine:
   let currentScreen = $state<'vault' | 'save' | 'empty' | 'confirm-open' | 'delete-confirm'>('vault') 3. Connect to existing stores:
   - drawings, isLoading, error
   - getCurrentDrawingData(), saveDrawing(), deleteDrawing()
3. Port styling from UI proposal (360x440px, border, shadows)

---

Phase 5: Integration & Polish

1. Message passing
   - Keep existing background.ts and excalidraw-content/index.ts
   - Ensure new components emit correct MessageType events
2. Responsive design
   - UI proposal is 360px wide, ensure this works in WXT popup
3. Transitions
   - Add screen transitions using tw-animate-css
   - Button hover states, dialog animations
4. Accessibility
   - Keyboard navigation
   - ARIA labels (inherited from shadcn-svelte)

---

Phase 6: Testing

1. Test all screens:
   - Save drawing
   - List/search drawings
   - Open drawing (with confirmation)
   - Delete drawing (with confirmation)
   - Empty state
2. Test edge cases:
   - No active Excalidraw tab
   - Empty vault
   - Large drawing names
   - Failed operations

---

Questions to Resolve

1. Thumbnail generation: UI proposal shows placeholders - should we generate real thumbnails from imageBase64 or keep placeholder icons?
2. Storage quota: UI proposal shows "2.4 MB used" - should we calculate and display actual storage usage?
3. Search implementation: Should search filter client-side or via a new store method?
4. Context menu: Implement dropdown or simpler action buttons per drawing?
5. Icons: Use Lucide Svelte or existing inline SVG icons?
   ▣ Plan · glm-4.7 · 2m 15s
6. Keep placeholders
7. No, we don't need that feature.
8. Put the search field, but do not connect to any search feature for now
9. Dropdown, only with "delete" option for now.
   Thinking: The user has answered my questions:
10. Keep placeholders (thumbnails)
11. No storage quota feature
12. Search field present but not connected
13. Dropdown with only "delete" option
    Now I should finalize the plan based on these answers. Let me refine the plan to be more concise and actionable, incorporating these decisions.
    Refined Porting Plan: NextJS UI Proposal → Svelte
    Architecture

- WXT + Svelte 5 + shadcn-svelte (Bits UI)
- Tailwind CSS v4 with OKLCH tokens
- Merge tabs into single flow
- Lucide Svelte icons

---

Phase 1: Design System Setup

1. Install dependencies:
   npm install -D bits-ui lucide-svelte tailwind-merge clsx class-variance-authority tw-animate-css
   npm install @internationalized/date
2. Initialize shadcn-svelte:
   npx shadcn-svelte@latest init
   - Config: $lib/components/ui for components
   - Keep existing Tailwind v4 setup
   - Port OKLCH color tokens from app/globals.css
3. Copy CSS variables to src/app.css:
   - Background, foreground, card, primary (amber), destructive, muted, border
   - Custom vault tokens: glow, surface, success, warning

---

Phase 2: Base Components
Add via shadcn-svelte CLI or create manually:

1. Button - all variants, sizes
2. Input - focus states, validation styles
3. Dialog - Root, Portal, Overlay, Content, Header, Footer, Title, Description, Close
4. Label - form labels
5. Dropdown Menu - for delete action
6. Separator - dividers

---

Phase 3: Excalivault Components
Create $lib/components/excalivault/:

1. VaultLogo.svelte - Shield icon + text with glow
2. SaveToVault.svelte - Form to save current drawing, with loading/success states
3. VaultList.svelte - List with search input (disconnected), thumbnails (placeholders), dropdown (delete only)
4. EmptyVault.svelte - Empty state with CTA
5. ConfirmOpen.svelte - Dialog warning before opening
6. DeleteConfirm.svelte - Dialog warning before deleting
7. FutureFeatures.svelte - Roadmap display

---

Phase 4: Popup.svelte Refactor

1. Remove tabs, add screen state:
   let currentScreen = $state<'vault' | 'save' | 'empty'>('vault')
   let dialogOpen = $state<boolean>(false)
   let dialogType = $state<'confirm-open' | 'delete-confirm' | null>(null)
2. Wire to existing stores:
   - loadDrawings() on mount
   - saveDrawing() from SaveToVault
   - deleteDrawing() from VaultList dropdown
   - openDrawing() with ConfirmOpen dialog
3. Port styling: 360x440px popup, borders, shadows from UI proposal

---

Phase 5: Integration

1. Keep background.ts and excalidraw-content/index.ts unchanged
2. Message passing: Ensure new components emit correct MessageType
3. Error handling: Display $error from stores
4. Loading states: Show spinner during operations

---

Implementation Order

1. Setup design system + base components
2. VaultLogo + EmptyVault
3. SaveToVault + integrate with saveDrawing()
4. VaultList + dropdown delete
5. ConfirmOpen/DeleteConfirm dialogs
6. Popup.svelte screen management
7. Test full flow
