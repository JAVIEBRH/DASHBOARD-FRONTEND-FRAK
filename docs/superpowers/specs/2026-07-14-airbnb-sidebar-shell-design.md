# Airbnb sidebar shell — design spec

Date: 2026-07-14
Status: Approved by user, ready for implementation plan
Repo: DASHBOARD-FRONTEND-FRAK (this spec is frontend-only; no backend changes needed for this pass)

## Context

Send Austral's dashboard (Vite + React frontend, Vercel-hosted, Mongoose/Mongo
backend in `DASHBOARD-BACKEND-FRAK`) currently has:

- A "Negocios" sidebar group with a single item, "Ave Austral"
  (`src/components/views/AveAustral.jsx`), an artisan-goods business view.
- An "Operaciones" sidebar group with a single item, "Stock"
  (`src/components/views/Stock.jsx`), which is a **fully built** feature:
  CRUD for consumables/furniture, low-stock alert toast on load, and a red
  badge count on the sidebar nav item (wired via `App.jsx`'s
  `badgeCounts={{ stock: stockAlertCount }}` prop into `Sidebar` → `NavItem`).
- A "General" group item "calendar" (`src/components/views/Calendar.jsx`,
  labeled "Vista mensual") which is a **financial monthly rollup**
  (income/expense by month), unrelated to booking dates. This view and its
  `calendar` id are untouched by this spec.

The user wants to retire "Ave Austral" entirely and introduce a new
"Airbnb" section that will eventually host: a real booking calendar
(Airbnb-style day grid with stay bars, reacting to the existing year/month
picker, with a "Registrar estadías" action and manual cleaning-scheduling
between stays), the existing Stock feature (relocated), a Kanban task board,
and an aggregating "Resumen" overview.

This spec covers **only the navigation shell**: sidebar restructure,
expand/collapse behavior, relocating the existing Stock feature, and
placeholder views for the three not-yet-built sub-sections. The booking
Calendar, Kanban, and Resumen features each get their own brainstorm → spec →
plan cycle later (each likely touching the backend too, e.g. new Mongoose
models for stays/cleanings/tasks following the exact pattern already used by
`StockItem` in `DASHBOARD-BACKEND-FRAK/lib/models/StockItem.js` — new model,
bundled into `GET /api/data`, mutations via `/api/<resource>` and
`/api/<resource>/[id]`).

## Goals

- Remove "Ave Austral" from the sidebar and from the view router. No business
  logic tied to Ave Austral remains reachable in the UI.
- Remove the "Operaciones" group; its "Stock" item moves under the new
  "Airbnb" group, unchanged in behavior (same `id: 'stock'`, same component,
  same badge-count wiring).
- Add an "Airbnb" sidebar item that expands/collapses to reveal 4 sub-items:
  Resumen, Calendario, Stock, Kanban.
- Resumen, Calendario, and Kanban route to a shared placeholder view so the
  shell is fully wired and ready for each feature to be built independently
  later.

## Non-goals

- Building the real booking Calendario (day-grid with stay bars, "Registrar
  estadías" button, manual cleaning scheduling), Kanban (task board), or
  Resumen (aggregator) content. Placeholders only in this pass.
- Any changes to `DASHBOARD-BACKEND-FRAK` (no new models/API routes yet).
- Any change to the existing "Vista mensual" (`calendar` id) — it keeps its
  current id, label, and location in the "General" group.
- Any change to Stock's internal behavior — only its nav placement changes.

## Navigation model

`NAV_GROUPS` in `src/utils/categories.js` changes from:

```js
export const NAV_GROUPS = [
  { label: 'Vista principal', items: [...] },
  { label: 'General', items: [...] },
  { label: 'Negocios', items: [
    { id: 'ave_austral', label: 'Ave Austral', icon: 'sparkle' },
  ]},
  { label: 'Operaciones', items: [
    { id: 'stock', label: 'Stock', icon: 'box' },
  ]},
  { label: 'Socio', items: [...] },
  { label: 'Plan', items: [...] },
];
```

to:

```js
export const NAV_GROUPS = [
  { label: 'Vista principal', items: [...] },   // unchanged
  { label: 'General', items: [...] },            // unchanged (keeps 'calendar')
  { label: 'Airbnb', items: [
    {
      id: 'airbnb', label: 'Airbnb', icon: 'home', expandable: true,
      children: [
        { id: 'airbnb_resumen',     label: 'Resumen',    icon: 'leaf'    },
        { id: 'airbnb_calendario',  label: 'Calendario', icon: 'calendar'},
        { id: 'stock',              label: 'Stock',      icon: 'box'     },
        { id: 'airbnb_kanban',      label: 'Kanban',     icon: 'columns' },
      ],
    },
  ]},
  { label: 'Socio', items: [...] },              // unchanged
  { label: 'Plan', items: [...] },               // unchanged
];
```

("Negocios" and "Operaciones" groups are deleted outright, not just their
items — no group with zero items should remain.)

### Sidebar rendering (`Sidebar.jsx` / `NavItem.jsx`)

`Sidebar.jsx` currently does a flat `group.items.map(item => <NavItem .../>)`.
It needs to special-case items with `expandable: true`:

- Render the parent as a `NavItem`-like button, but instead of calling
  `setView(item.id)` directly on click, it toggles local expand state (see
  below) and — when expanding from collapsed — also calls
  `setView('airbnb_resumen')`.
- When expanded, render each `children` entry as a `NavItem` with an added
  `sub` visual treatment (indented, smaller), passing through the existing
  `active`/`badgeCount` props exactly as today (so `stock`'s badge count
  keeps working unmodified — `badgeCounts={{ stock: stockAlertCount }}` in
  `App.jsx` does not need to change).
- The parent row is visually "semi-active" (distinct style from a fully
  active leaf) whenever `view` is `stock` or starts with `airbnb_`.
- The parent row shows a `chevron_right` icon that rotates 90° when expanded,
  reusing the rotation pattern already used in
  `src/components/layout/MonthPicker.jsx` for its own chevron.

### State (`App.jsx`)

- New state: `const [expandedGroup, setExpandedGroup] = useState(null);`
- New effect:
  ```js
  useEffect(() => {
    if (view === 'stock' || view.startsWith('airbnb_')) setExpandedGroup('airbnb');
  }, [view]);
  ```
- `Sidebar` receives `expandedGroup` and a setter (`onToggleGroup` or similar)
  as new props alongside the existing `view`/`setView`/`year`/`badgeCounts`.

### Click behavior

- Clicking the "Airbnb" parent row:
  - Collapsed → expand AND `setView('airbnb_resumen')`.
  - Expanded (regardless of which child is active) → collapse (does not
    change `view`).
- Clicking a child item (`airbnb_resumen`, `airbnb_calendario`, `stock`,
  `airbnb_kanban`) calls `setView(childId)` directly; the effect above
  guarantees the group re-expands if it had been collapsed.

## Placeholder view

One new component, `src/components/views/AirbnbPlaceholder.jsx`:

```jsx
export function AirbnbPlaceholder({ title, description, icon }) {
  return (
    <div>
      <div className="v-section-head">
        <div>
          <div className="v-eyebrow">Airbnb</div>
          <h1 className="v-section-title">{title}</h1>
        </div>
      </div>
      <div className="v-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <Icon name={icon} size={32} color="var(--ink-3)" />
        <p style={{ marginTop: 14, color: 'var(--ink-3)', fontSize: 14 }}>{description}</p>
      </div>
    </div>
  );
}
```

Used for the 3 not-yet-built views:

| view id            | title      | description                                              | icon      |
|---------------------|------------|-----------------------------------------------------------|-----------|
| `airbnb_resumen`    | Resumen    | "Vista general de reservas, stock y tareas — próximamente" | `leaf`    |
| `airbnb_calendario` | Calendario | "Calendario de reservas tipo Airbnb — próximamente"        | `calendar`|
| `airbnb_kanban`     | Kanban     | "Tablero de tareas — próximamente"                         | `columns` |

`stock` is NOT a placeholder — it renders the existing `<Stock ... />` exactly
as it does today, just reached via the new nav path.

`App.jsx`'s `VIEW_TITLE` map and render switch update accordingly:

```js
const VIEW_TITLE = {
  overview: 'Resumen',
  ingresos: 'Ingresos',
  costos: 'Costos',
  transactions: 'Movimientos',
  calendar: 'Vista mensual',
  gastos: 'Costos',
  socio: 'Mov. de socio',
  budget: 'Presupuesto 2026',
  stock: 'Stock',
  airbnb_resumen: 'Airbnb · Resumen',
  airbnb_calendario: 'Airbnb · Calendario',
  airbnb_kanban: 'Airbnb · Kanban',
};
```

(`ave_austral` entry removed.)

## Removal of Ave Austral

- Delete `src/components/views/AveAustral.jsx` (91 lines) entirely.
- Remove the `AveAustral` import and the `view === 'ave_austral'` branch from
  `App.jsx`.
- Remove the `ave_austral` entry from `VIEW_TITLE`.
- Remove the "Negocios" group from `NAV_GROUPS` (see above).
- The `ARTESANIAS` transaction category and its data plumbing in
  `DASHBOARD-BACKEND-FRAK` are untouched — those transactions keep
  contributing to Ingresos/Costos/Movimientos/Gastos exactly as before. Only
  the dedicated business view disappears.

## Visual / CSS additions

- One new icon in `src/components/ui/Icon.jsx`: `columns` (Kanban). `home`,
  `calendar`, `leaf`, and `box` already exist and are reused.
- New CSS in the stylesheet consumed by `Sidebar`/`NavItem` (wherever
  `.v-nav-item` etc. are currently defined):
  - `.v-nav-item.sub` — indented, smaller-font variant for the 4 children.
  - Chevron rotation treatment on the parent row, following the existing
    inline-style rotation pattern in `MonthPicker.jsx`.

## Testing / verification

No automated test suite exists in this frontend (confirm via `package.json`
before writing the plan — if one exists, follow it; otherwise this is manual
browser verification against the dev server, e.g. `npm run dev`):

- Click "Airbnb" from collapsed → expands and lands on the Resumen
  placeholder; breadcrumb/title reads "Airbnb · Resumen".
- Click "Calendario" and "Kanban" → correct placeholder content and title for
  each.
- Click "Stock" under the new group → the existing Stock view renders
  unchanged, including its low-stock badge count on the nav item.
- Click "Airbnb" again while a child is active → collapses without changing
  `view`.
- Navigate to another top-level section (e.g. "Ingresos") and then directly
  to a child route (e.g. click "Stock") → group auto-expands via the effect.
- Confirm "Ave Austral" no longer appears anywhere in the sidebar, and that
  Ingresos/Costos/Movimientos/Gastos totals are unchanged (still include
  `ARTESANIAS` transactions).
- Confirm the app builds (`npm run build` or equivalent) with no leftover
  references to the deleted `AveAustral` component.

## Out of scope / follow-up specs

- **Calendario**: real day-grid booking calendar (Airbnb-style bars across
  dates), reactive to the existing year/month picker, "Registrar estadías"
  button for manual stay entry, manual cleaning scheduling between stays.
  Will likely need a new backend model (e.g. `Estadia`/`Limpieza`) following
  the `StockItem` pattern.
- **Kanban**: task board for manual to-dos (e.g. cleanings, maintenance). Will
  likely need a new backend model (e.g. `KanbanTask`) following the same
  pattern.
- **Resumen (Airbnb)**: aggregating overview, built once the above two exist
  and there's real data to summarize.

Each of the above gets its own brainstorm → spec → plan cycle before
implementation.
