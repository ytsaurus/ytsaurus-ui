# @ytsaurus/components

**English** | [Русский](README.ru.md)

A library of **core React components** for building UIs around YTsaurus.

---

## Installation

Install the package together with its **peer dependencies**:

```bash
npm install @ytsaurus/components
```

Required versions: `react` / `react-dom` ≥ 16.8, `@gravity-ui/uikit` ≥ 7, `@gravity-ui/icons` ≥ 2, `@gravity-ui/table` ≥ 1, `@gravity-ui/date-utils` ≥ 2 (see `package.json`).

Your app must load base UIKit styles. Theming is up to the host application:

```ts
import '@gravity-ui/uikit/styles/styles.css';
```

---

## Entry points

| Import | Purpose |
|--------|---------|
| **`@ytsaurus/components`** | Components (`ColumnCell`, `MetaTable`, …), types, hooks (`useNavigationTableData`), **HTTP helpers** for navigation (see below). |
| **`@ytsaurus/components/modules`** | **`NavigationTable`** shell plus **`SchemaTab`**, **`PreviewTab`** (and types such as `NavigationTableProps`). |

The root entry re-exports **`src/api`**: a single place for loading table data and the YT API wrapper.

---

## API for tables and the cluster

In the package sources everything is wired from **`src/api/index.ts`**:

- **`loadTableAttributesByPath`** — given a table path, loads attributes and rows; returns the payload used by the tabs (schema, preview, meta).
- **`loadFolderByPath`**, **`loadNodeByPath`** — load navigation nodes by path.
- **`ytApiV3`** — low-level YT v3 client (from `@ytsaurus/javascript-wrapper`).

After installation import from the package root:

```ts
import {
  loadTableAttributesByPath,
  loadFolderByPath,
  loadNodeByPath,
  ytApiV3,
} from '@ytsaurus/components';
```

For **`YTApiSetup`** and full function signatures see the published types (`build/esm` after `npm run build`) or **`src/api/navigation/*.ts`**.

---

## `NavigationTable` module

Implementation: **`src/modules/NavigationTable`**. From npm:

```ts
import { NavigationTable } from '@ytsaurus/components/modules';
```

The component is **presentational**: you pass loaded data (`table`), optional schema-column filter, callbacks, and YSON settings for preview. When `table` is null, `emptyMessage` is shown.

### Minimal example

Below, data is loaded with **`loadTableAttributesByPath`** and rendered with **`NavigationTable`**. Replace `setup` and `options` with your cluster proxy, limits, user, etc.; this is only a structural sketch.

```tsx
import {useCallback, useEffect, useState} from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';
import '@gravity-ui/uikit/styles/styles.css';

import {loadTableAttributesByPath} from '@ytsaurus/components';
import {NavigationTable} from '@ytsaurus/components/modules';

type LoadedNavigationTable = Awaited<ReturnType<typeof loadTableAttributesByPath>>;

const TABLE_PATH = '//home/my_cluster/my_table';

export function TableExplorer() {
    const [table, setTable] = useState<LoadedNavigationTable | null>(null);
    const [filter, setFilter] = useState('');
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setError(null);
        try {
            const data = await loadTableAttributesByPath(
                TABLE_PATH,
                {
                    proxy: 'https://your-yt-proxy.example/', // see YTApiSetup
                    // requestHeaders, JSONSerializer, … as needed
                },
                {
                    clusterId: 'my_cluster',
                    login: 'robot-user',
                    limit: 100,
                    cellSize: 256,
                    useYqlTypes: true,
                    showDecoded: false,
                    // docsUrls, navigationTableConfig — see option types
                },
            );
            setTable(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    return (
        <ThemeProvider theme="light">
            {error && <p>{error}</p>}
            <NavigationTable
                table={table}
                filter={filter}
                onFilterChange={setFilter}
                emptyMessage="Pick a table or load data"
            />
        </ThemeProvider>
    );
}
```

A fuller integration (Redux, `navigationTableConfig`, doc links) lives in **`packages/ui`** (e.g. query-tracker actions and meta config for `MetaTable`).

---

## `useNavigationTableData` hook

If you prefer to own loading by path, use **`useNavigationTableData`** from **`@ytsaurus/components`** with a **`NavigationTableDataAdapter`** and still render **`NavigationTable`** from **`@ytsaurus/components/modules`**. See **`src/hooks/useNavigationTableData.ts`**.

---

## Building the package

From **`packages/components`**:

```bash
npm run build
```

Output: **`build/esm/`** (`main` / `exports` / `types` in `package.json`).

---

## Storybook

Locally: **`npm run storybook`** (port **6006**). If **`npm run build:storybook`** created **`storybook-static`**, Vite dev may reload excessively — that directory is ignored in **`.storybook/main.ts`**; if anything glitches, remove **`node_modules/.cache/storybook`**.

---

## `theme-default.scss`

**`theme-default/theme-default.scss`** at the package root is used by **Storybook** and **Playwright** in this repo only and is **not** part of the published npm bundle (`files` in `package.json`). Configure Gravity UI theming in your own app.
