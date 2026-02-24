# @ytsaurus/yt-components

Navigation table component and API for path-based table data (schema, preview, meta tabs). Usable in any context where you need to show a table by path.

## Structure

- **`NavigationTable`** — presentational component with Schema / Preview / Meta tabs. Uses built-in tabs by default; optional `renderSchemaTab`, `renderPreviewTab`, `renderMetaTab` let the host supply custom tab content.
- **`useNavigationTableData`** — hook that returns `{ table, tableWithFilter, loading, error, filter, setFilter, load }`. Host implements `NavigationTableDataAdapter` with `loadTable(path)` (e.g. using Redux/YT API).
- **`loadTableAttributesByPath`** — loads table by path (attributes, schema, preview rows). Returns `NavigationTable` with `meta` (Meta tab content); optional `navigationTableConfig` for SubjectCard / renderYqlOperationLink.

## Usage

### NavigationTable component (with Redux / existing data)

Wrap the app (or subtree) in `YtComponentsConfigProvider`, then pass table data and callbacks to `NavigationTable`. Table data is typically loaded via `loadTableAttributesByPath` in a Redux thunk and stored in state.

```tsx
import {
  NavigationTable,
  YtComponentsConfigProvider,
} from '@ytsaurus/yt-components';

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
      />
    </YtComponentsConfigProvider>
  );
}
```

Real usage: `packages/ui/src/ui/pages/query-tracker/Navigation/NavigationTable/NavigationTable.tsx`.

### loadTableAttributesByPath (load table by path)

Use in Redux thunks (or any async flow) to load a table by path. Pass your YT API `setup` and options; the function returns a `NavigationTable` with `meta` (Meta tab content) already built. Optionally pass `navigationTableConfig` (e.g. SubjectCard, renderYqlOperationLink) for app-specific meta rendering.

```tsx
import { loadTableAttributesByPath } from '@ytsaurus/yt-components';

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
      renderYqlOperationLink: (id) => renderYqlOperationLink(id),
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
  NavigationTable,
  useNavigationTableData,
  type NavigationTableDataAdapter,
} from '@ytsaurus/yt-components';

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
- `@gravity-ui/uikit` >= 1.0.0

## Build

```bash
npm run build
```

Output is in `dist/`.
