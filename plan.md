
- edit previous message                                                       [crox] 

- 3 dots, vertial, right of send button - access to tools modual              [tick]

- pricing tool

- availability scanner: new page, arrive from modal, 
  find the most optimal route based on user needs. often will be cheapest



--- focus ---


- iframe extention, so can work alongside amadeus

- keep context, even on close extension, until reset is specifically clicked.


---

## Version Strategy: Breaking Down the Problem

---

## **v1.1.3 - State Persistence Foundation**
**Focus:** Memory across popup sessions

**What it solves:**
- Chat messages persist in chrome.storage.local
- Form data survives popup close/reopen
- View state (form vs chat) is remembered
- User can click on webpage, reopen extension, and continue exactly where they left off

**Why this first:**
- Core infrastructure for persistence
- No UI changes needed
- Solves the "context loss" problem
- Small, testable, low-risk change

**Files to touch:**
- Create: `src/lib/storage.ts`
- Modify: `src/hooks/useChatMessages.ts`
- Modify: `src/components/ExtensionLayout.tsx`
- Update: `package.json` version
- Update: `dist/manifest.json` version

---

## **v1.1.4 - Iframe Integration** 
**Focus:** Extension stays visible (Honey-like behavior)

**What it solves:**
- Extension doesn't close when clicking webpage
- Renders as overlay/sidebar instead of popup
- User can interact with both webpage AND extension simultaneously

**Why this second:**
- Builds on stable persistence layer from 1.1.3
- Major architectural change (popup → iframe/sidebar)
- Requires manifest changes (side_panel or content_script approach)
- More complex, needs careful testing

**Files to touch:**
- Modify: `dist/manifest.json` (add content_scripts or side_panel)
- Create: `src/content.ts` (if content script approach)
- Create: `src/iframe.html` (embedded view)
- Modify: Build process to handle new entry points
- Possibly add toggle button for show/hide

---

## **v1.1.5 - Polish & UX Refinements**
**Focus:** Smooth transitions and edge cases

**What it solves:**
- Loading states while hydrating from storage
- Smooth animations for view transitions
- Handle edge cases (storage quota, corrupted data)
- Optional: Collapse/expand animation
- Optional: Position settings (left/right/bottom)

**Why this last:**
- Purely UX improvements
- Non-critical enhancements
- Can gather user feedback from 1.1.3 and 1.1.4 first

---