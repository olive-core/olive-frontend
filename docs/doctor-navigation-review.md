# Doctor navigation: implementation and next design pass

## Second design pass — completed

Home, its queue, and the running consultation page were left unchanged in this pass. The shared navigation from the first pass remains in place.

| Page to review | Visible changes |
| --- | --- |
| `/doctor/chambers` | Compact chamber cards; room shown separately; pad configuration status; labelled attendant disclosure; Add chamber at the top; edit/delete in a chamber action menu; loading and retry states |
| `/doctor/account/preferences` | One grouped workflow in dependency order: prescription writing, automatic drafting, patient delivery; dependent preferences retained but disabled while writing is off; existing disable confirmation retained |
| `/doctor/billing` | Two-column duration choices on narrow screens, four columns on wider screens; selected-duration accessibility state; more room for payment details; explicit load retry |
| `/doctor/memory` | Separate Pinned and Other memories groups; search results remain a single group; full New memory label; keyboard-accessible cards; larger pin/delete targets separated from titles |
| `/doctor/insights` | Mobile question selector; period first; secondary mobile filters expand on demand; applied filters stay visible; follow-up prompt follows the answer |
| `/doctor/consultations` | Search first; ownership filters next; date filtering beside them where space permits; controls wrap on smaller screens |

Responsive details include wrapping long names, bounded scrolling for affected dialogs/popovers, mobile-sized controls, and layouts that adapt without changing selection state. Home and active consultation components have no diffs. The in-app Browser remained unavailable, so no screenshot or physical-device visual validation is claimed.

The review below records the original recommendations. Items listed as completed above supersede their earlier “next pass” status; remaining ideas are not implemented.

## Implemented

The doctor header now exposes Home, Consultations, Memory, and Insights as labelled destinations. The identity menu contains Practice & account, Membership, and Sign out. Routine membership status lives inside that menu; actionable dashboard notices retain their existing behavior.

Practice & account opens Profile beside a grouped section menu on desktop. Below 1024px, its entry page presents the grouped section list; individual sections have a return link and use the full content width. Existing Profile, Chambers, Billing, Device Check, and prescription-editor URLs remain valid.

Mobile clinical navigation uses a second header row. This keeps the bottom of the screen available for recording controls, prescription editing sheets, and the pad editor’s Preview/Save bar. This choice should still be checked on short landscape screens and with the software keyboard open.

Profile contains personal and professional details. Saving preserves existing pad configuration and synchronizes designation with specialization using the same mapping as the pad editor. The pad editor’s existing click-to-edit identity controls remain available. Auto-drafting moved to Consultation preferences; changes update both the server and the active consultation preference in the auth store. Existing disable confirmations remain in place.

## File map

Paths are relative to `src/`.

| File or directory | Responsibility |
| --- | --- |
| `components/dashboard/navbar.tsx` | Clinical navigation, active states, identity menu, mobile layout |
| `components/dashboard/subscription/status-pill.tsx` | Non-interactive membership status in the identity menu |
| `components/dashboard/practice-account/sections.ts` | Explicit Personal / Practice / Account section definitions |
| `components/dashboard/practice-account/account-layout.tsx` | Desktop section menu, mobile index, headings and return navigation |
| `components/dashboard/practice-account/profile-section.tsx` | Profile loading/error states, identity form, account phone |
| `components/dashboard/practice-account/unsaved-changes-dialog.tsx` | Protect unsaved Profile edits during navigation and unload |
| `components/clinician/profile-form.tsx` | Professional details, pad synchronization, section-local saving |
| `components/clinician/drafting-preference.tsx` | Automatic drafting preference and immediate session synchronization |
| `components/clinician/consultation-settings-card.tsx` | Existing consequential settings, accessible switch labels and touch targets |
| `routes/doctor/account/` | New entry, preferences, and prescription-pad settings pages |
| Existing Profile, Chambers, Billing, Device Check routes | Wrap existing functionality in the shared account layout |
| `components/dashboard/chambers/chambers-manager.tsx` | Allow embedding without a duplicate heading or page container |
| `components/prescription/header/editor/header-editor.tsx` | Return to pad settings; sticky content respects the doctor header |
| `routes/doctor/route.tsx`, `index.css` | Responsive header clearance scoped to the doctor portal |
| `routeTree.gen.ts` | Generated route registration |

`test/account-navigation/` exercises the actual router and forms with a stubbed network: active navigation, unsaved changes, save failure, preservation of pad data, and drafting preference synchronization. The existing Memory test fixture was updated to supply the clinician ID already required by its eligibility function, with a check that another clinician’s consultation is excluded.

## Review of Practice & account

These are recommendations for the next pass, not additional implemented changes. They are based on source review, without live usage analytics or a completed visual browser review.

### Profile — preserve the focused form

Recommended order: personal name → professional identity → account phone. The form is now focused on this job. Keep the relationship to printed details close to those fields. Keep account phone explicitly read-only. Avoid reinstating a large duplicated summary card next to the same editable information.

On mobile, retain one column and full-width multiline fields for qualifications and designation. Show Save and Reset together after the form. A sticky save region is worth considering only if this form grows substantially.

### Chambers & attendants — highest priority for the next pass

Every chamber currently exposes its attendant roster and a full phone-entry form. The page grows rapidly with each location.

Recommended card order: chamber identity and room → prescription-pad status/link → attendant summary → Manage attendants action. Open the detailed roster and Add attendant form on demand. Keep the chamber itself identifiable while that area is expanded. Put Add chamber beside the page heading, with a full-width placement on narrow screens. Keep delete in a secondary chamber action menu with the existing confirmation.

On mobile, stack chamber identity above actions; long hospital names and attendant names must wrap. Avoid columns for phone numbers and pending status when the remaining width is too small.

### Prescription pad — distinguish setup from editing

The new settings page provides an explicit entry into the wide editor. Its next improvement could be a small read-only preview of the selected chamber’s pad and its configuration status, replacing generic explanatory content. Only use real saved state for that preview.

Within the editor, retain the existing flat expandable sections, first-run paper questions, and mobile Preview sheet. Those already match the task well. Prioritize chamber/paper choice, then printed identity, then appearance, then footer details. Preserve click-to-edit behavior in the desktop paper preview.

### Consultation preferences — show dependencies in order

Recommended order: Write prescriptions in Olive → Automatically draft prescriptions → Text prescriptions to patients. This exposes the parent setting before its dependent preferences.

Use a single coherent group with brief descriptions, separating patient delivery visually. When prescription writing is off, explain that draft and delivery preferences are retained but not currently effective. Keep existing confirmations for consequential disable actions. Never use visual reordering to change their meaning or defaults.

### Devices — keep the existing task-first order

The existing test-first, collapsed-troubleshooting structure is good. A useful next addition would be a compact summary of the last test on this device, including when it ran. Clearly distinguish that historical result from current microphone readiness.

Keep the test action and result before troubleshooting. Long microphone names should wrap, and any audio playback control should fit the container on small screens.

### Membership — status and next action first

Recommended order: membership status and expiry/remaining access → required next action → plan and price → payment duration → payment instructions.

Pending payment should replace the renewal action with review status. Avoid showing competing payment prompts. The current four-column duration selector should become two columns on narrow phones, with total amount kept visible before submission. Retain one coherent payment flow.

## Review of the clinical pages

| Page | Recommended organization | Mobile consideration |
| --- | --- | --- |
| Home | Keep active chamber and next patient first, followed by the waiting queue. Preserve the existing single dominant start action. A secondary Add walk-in path could be useful while the queue has patients, subject to the team’s queue policy. | Reduce decorative vertical spacing on short screens. Keep the next patient and Start action visible before the queue list. |
| Consultations | Keep patient search first, then All / Mine / Shared. Treat date filtering as secondary while keeping applied dates visible. Preserve the existing grouping by day. | Avoid letting stacked filters consume the first screen; expose the active filter summary and a clear reset action. |
| Consultation detail | Establish patient, visit date, and case context first; then Prescription / Clinical note; then the document. Prioritize Follow-up when permitted, with Print and Share as secondary actions. | Stack identity and actions. Keep case-history navigation legible rather than compressing it between controls. |
| Live consultation | Preserve patient context and recorder status/actions as the primary area, with relevant prior consultation history next. The current floating recorder already maintains access when navigating away. | Keep recorder controls and sync warnings accessible. Avoid adding global bottom navigation over them. |
| Prescription review | Maintain patient identity, document selection, editable clinical content, and finalization in a predictable order. Keep regeneration, printing, and finalization visually distinct according to their consequences. | Preserve the existing focused editor sheets and keyboard-aware controls. Check that the taller global header leaves enough space in landscape. |
| Memory library | Keep search at the top, then a clearly labelled Pinned group, then the rest. Keep New memory prominent and delete secondary. Existing pin controls are useful, but an explicit section makes their purpose easier to see. | Stack cards, wrap long names, and retain a labelled creation action. |
| Memory editor | Keep name and a compact “fills these sections” summary first, followed by sections in prescription order. Keep Save readily reachable without adding a competing action bar to clinical screens. | Add an optional section jump control only if actual editing sessions show excessive scrolling. |
| Insights | Bring the selected clinical question and answer closer together. Keep period visible; move advanced scope/filter controls behind Refine. Preserve links from findings to the relevant consultations. | Six long question labels in a horizontal rail are easy to overlook. Consider one labelled question selector with the chosen answer immediately beneath it. |

## Responsive acceptance checks

Implementation includes full-width section pages below 1024px, a mobile account index, flexible content columns, labelled clinical links, safe-area header spacing, 44px targets for new navigation/switches, and 16px mobile profile fields. Existing mobile editor behavior remains covered by its automated tests.

Visual checks still required: 320, 375/390, 768, 1024, and 1440px widths; short landscape viewport; 200% zoom; long English and Bangla names; software keyboard; open account menu; unsaved-change dialog; pad editor with Preview/Save; active floating recorder; and printed prescription output. Also check keyboard focus and reduced-motion settings.

Do not interpret responsive CSS or DOM tests as proof of support for every physical device. The Browser plugin reported that the in-app browser was unavailable in this session, so screenshots, overflow measurements, and real-device interaction have not been verified.

## Validation

Production build, lint for changed application files, and whitespace checks pass. Queue, recording, Arise, printing, Memory, mobile editor, pad setup, and the new account-navigation suites all pass. The build still emits its large-chunk warning.

Recommended next design order: Chambers & attendants → Consultation preferences → mobile Insights → Membership → smaller refinements elsewhere.

## Pre-push review

The header account label uses `Dr. Firstname`; the full name wraps inside the dropdown. Long first names retain the width cap. Formatting handles existing doctor prefixes without treating names such as Drake as a title.

Production build, the full test suite, and lint for every changed application file pass. Existing doctor URLs and backend request contracts are preserved; no database, backend, infrastructure, or dependency changes are required. No new breaking change was identified in the source and automated checks.

Repository-wide `npm run lint` still reports 15 errors and 2 warnings in unchanged files (probe tooling, shared form/UI components, and prescription formatting/printing). The error-bearing files were checked against the pre-change commit. Browser visual QA remains unverified because the in-app Browser is unavailable. The production build also retains its large-chunk warning. These are explicit limits of the readiness assessment, not a claim that every device has been visually tested.
