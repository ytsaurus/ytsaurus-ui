# @ytsaurus/components

Navigation table component and API for path-based table data (schema, preview, meta tabs). Usable in any context where you need to show a table by path.

The root entry also re-exports shared building blocks used inside the library (for example `MetaTable`, `DataTableYT`, schema/Yson helpers, presets). Prefer importing only what you need for your integration.

## Entry points

- **`@ytsaurus/components`** — navigation API (`loadTableAttributesByPath`, `loadFolderByPath`, `loadNodeByPath`), `ytApiV3`, hooks (`useNavigationTableData`), `YtComponentsConfigProvider`, shared UI primitives and types (everything exported from the root `exports` / `.` entry of this package).
- **`@ytsaurus/components/modules`** — `NavigationTable`, `SchemaTab`, `PreviewTab`, and `NavigationTableProps`. The Meta tab renders **`MetaTable`** from the root package by default, or custom content via `renderMetaTab` on `NavigationTable`.

Use the main package for data loading and config; use `/modules` for the table shell and tab building blocks.

## Structure

- **`NavigationTable`** (from `@ytsaurus/components/modules`) — presentational component with Schema / Preview / Meta tabs. Uses built-in tabs by default; optional `renderSchemaTab`, `renderPreviewTab`, `renderMetaTab` let the host supply custom tab content.
- **`useNavigationTableData`** — hook that returns `{ table, tableWithFilter, loading, error, filter, setFilter, load }`. Host implements `NavigationTableDataAdapter` with `loadTable(path)` (e.g. using Redux/YT API).
- **`loadTableAttributesByPath`** — loads table by path (attributes, schema, preview rows). Returns table data with `meta` (Meta tab content); optional `navigationTableConfig` for SubjectCard / `renderMetaOperationLink`, etc.
- **`loadFolderByPath`** — loads folder children by path (list of nodes for navigation tree).
- **`loadNodeByPath`** — loads a single node by path (generic navigation helper).

## Installation / integration

1. Wrap the app (or subtree) in `YtComponentsConfigProvider` from `@ytsaurus/components` (you can use a local wrapper that provides `value` with `logError`, `docsUrls`, `unipika`, link templates, etc.).
2. Import **`NavigationTable`** from **`@ytsaurus/components/modules`**.
3. Import **`loadTableAttributesByPath`** and **`loadFolderByPath`** from **`@ytsaurus/components`** and use them in thunks (or any async flow) to load data; put result in state and pass to `NavigationTable`.

## Usage

### NavigationTable component (with Redux / existing data)

Wrap the app (or subtree) in `YtComponentsConfigProvider`, then pass table data and callbacks to `NavigationTable`. Table data is typically loaded via `loadTableAttributesByPath` in a Redux thunk and stored in state.

```tsx
import { YtComponentsConfigProvider } from '@ytsaurus/components';
import { NavigationTable } from '@ytsaurus/components/modules';

function MyNavigationTable() {
  const dispatch = useDispatch();
  const table = useSelector(selectTableWithFilter);
  const filter = useSelector(selectNavigationFilter);
  const ysonSettings = useSelector(getYsonSettings);

  const onFilterChange = useCallback((value: string) => {
    dispatch(setFilter(value));
  }, [dispatch]);

  const onInsertTableSelect = useCallback(async () => {
    // insert TABLE SELECT into editor
  }, []);

  return (
    <YtComponentsConfigProvider
      errorBoundaryComponent={ErrorBoundary}
      docsUrls={docsUrls}
      logError={logError}
      unipika={{ showDecoded: ysonSettings.showDecoded }}
    >
      <NavigationTable
        table={table}
        filter={filter}
        onFilterChange={onFilterChange}
        onInsertTableSelect={onInsertTableSelect}
        ysonSettings={ysonSettings}
        emptyMessage={i18n('context_empty-data')}
      />
    </YtComponentsConfigProvider>
  );
}
```

Real usage: `packages/ui/src/ui/pages/query-tracker/Navigation/NavigationTable/NavigationTable.tsx`. The app uses a local `YtComponentsConfigProvider` wrapper that injects Redux-driven config (see `packages/ui/src/ui/containers/YtComponentsConfigProvider`).

### loadTableAttributesByPath (load table by path)

Use in Redux thunks (or any async flow) to load a table by path. Pass your YT API `setup` and options; the function returns table data (with `meta` for the Meta tab). Optionally pass `navigationTableConfig` (e.g. SubjectCard, `renderMetaOperationLink`) for app-specific meta rendering.

```tsx
import { loadTableAttributesByPath } from '@ytsaurus/components';

// In a thunk (e.g. query-tracker navigation):
const loadTableAttributesByPathAction = (path: string) => async (dispatch, getState) => {
  const state = getState();
  const clusterConfig = selectNavigationClusterConfig(state);
  const { pageSize, cellSize } = getQueryResultGlobalSettings();
  const defaultTableColumnLimit = getDefaultTableColumnLimit(state);
  const useYqlTypes = isYqlTypesEnabled(state);
  const login = getCurrentUserName(state);
  const showDecoded = shouldShowDecoded(state);

  if (!clusterConfig) return;

  const setup = {
    proxy: getClusterProxy(clusterConfig),
    JSONSerializer, // or your app's serializer
  };

  const tableData = await loadTableAttributesByPath(path, setup, {
    clusterId: clusterConfig.id,
    login,
    limit: pageSize,
    cellSize,
    defaultTableColumnLimit,
    useYqlTypes,
    showDecoded,
    navigationTableConfig: {
      SubjectCard: (props) => <SubjectCard name={props.name} />,
      renderMetaOperationLink: ({ operationId, cluster, isQueryTracker }) => {
        const value = isQueryTracker
          ? <QueryTrackerLink queryId={operationId} cluster={cluster} />
          : renderYqlOperationLink(operationId);
        if (!value) return null;
        return {
          key: isQueryTracker ? 'QT operation' : 'YQL operation',
          value,
          visible: true,
        };
      },
    },
  });

  dispatch(setPath(path));
  dispatch(setTable(tableData));
  dispatch(setNodeType(BodyType.Table));
};
```

Real usage: `packages/ui/src/ui/store/actions/query-tracker/queryNavigation.ts` (see `loadTableAttributesByPath` thunk).

### Optional: hook + custom render tabs

If you prefer the hook and custom tab content:

```tsx
import {
  useNavigationTableData,
  type NavigationTableDataAdapter,
} from '@ytsaurus/components';
import { NavigationTable } from '@ytsaurus/components/modules';

const adapter: NavigationTableDataAdapter = {
  loadTable: async (path) => { /* load from YT API / Redux */ },
};

function MyNavigationTable() {
  const { tableWithFilter, filter, setFilter } = useNavigationTableData({
    path: currentPath,
    adapter,
  });

  return (
    <NavigationTable
      table={tableWithFilter}
      filter={filter}
      onFilterChange={setFilter}
      onInsertTableSelect={handleInsertSelect}
      ysonSettings={ysonSettings}
      renderSchemaTab={({ schema, filter, onFilterChange }) => (
        <YourSchemaTab schema={schema} filter={filter} onFilterChange={onFilterChange} />
      )}
      renderPreviewTab={({ table, onEditorInsert }) => (
        <YourPreviewTab table={table} onEditorInsert={onEditorInsert} />
      )}
      renderMetaTab={({ items }) => <YourMetaTable items={items} />}
    />
  );
}
```

## Peer dependencies

- `react` >= 16.8.0
- `react-dom` >= 16.8.0
- `@gravity-ui/uikit` >= 7.0.0
- `@gravity-ui/icons` >= 2.0.0
- `@gravity-ui/table` >= 1.0.0

## Build

```bash
npm run build
```

Build output is under `build/esm/` (see `package.json` `main` / `exports`).
