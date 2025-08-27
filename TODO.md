## Dashboard tabs and toolbar settings

High-level goal: Make dashboard tabs look like browser tabs, move the add button to the end of the tab list (opening a
name dialog), and add a settings button on the right side of the toolbar to manage projects (add, rename, delete).

### Browser-like dashboard tabs

- [ ] Update `src/components/toolbar.tsx` tabs UI to resemble browser tabs (rounded, segmented look; clear active state;
      subtle separators).
- [ ] Move the "Add" action into the `TabsList` as a trailing plus button; position after the last tab, visually
      integrated with the tab strip.
- [ ] Remove the existing standalone "Add" button at the far right of the toolbar.
- [ ] Ensure horizontal scroll for overflowed tabs, with scroll affordances and preserved selection.
- [ ] Keep per-dashboard actions (rename/delete) accessible from each tab (current dropdown is fine).

### "Create dashboard" dialog (triggered by the plus button)

- [ ] Open a `Dialog` asking for the dashboard name (single `Input`, label+placeholder, default focus).
- [ ] Validate non-empty; allow Enter to submit and Esc to cancel.
- [ ] On submit: call `DashboardsRepository.create`, then reload dashboards for the current project and select the newly
      created dashboard.
- [ ] Close dialog, restore focus to the tab strip; show a brief success toast if available (optional).

### Toolbar settings (project management)

- [ ] Add a `Settings` icon button at the right side of the toolbar.
- [ ] Clicking opens a dropdown with: Add project, Rename project, Delete project.
- [ ] Add project: open `Dialog` asking for project name; on submit, `ProjectsRepository.create`, refresh projects,
      select the new project, and reload dashboards for it.
- [ ] Rename project: open `Dialog` with current name prefilled; on submit, `ProjectsRepository.update`, refresh the
      projects list while keeping current selection.
- [ ] Delete project: open `AlertDialog` confirmation; on confirm, `ProjectsRepository.delete` (dashboards/widgets will
      cascade), then select the next available project (if any) and refresh dashboards.
- [ ] Style destructive actions using red only for the confirm button and text accents; avoid red elsewhere to match the
      minimal red scheme.

### State flow and side-effects

- [ ] Preserve and call `onProjectChange` and `onDashboardChange` props as today.
- [ ] Handle empty states: when there are no projects, show a gentle placeholder and guide users to Settings → Add
      project; when there are no dashboards, show an inline CTA to create one.
- [ ] Guard against double submissions (disable submit while saving).
- [ ] Ensure repository errors are surfaced (inline error message inside dialogs).

### Accessibility and UX polish

- [ ] Ensure keyboard navigation: Arrow keys to switch tabs, Tab order sensible; Enter submits dialogs, Esc closes.
- [ ] Add `aria-label`s for the plus button and settings button; add tooltips.
- [ ] Support light/dark modes and respect the project's color usage guidelines (use red only for destructive actions).

### Cleanup

- [ ] Remove the old standalone "Add" button and related code paths in `src/components/toolbar.tsx`.
- [ ] Update `README.md` screenshots/instructions if they reference the old layout (optional).
