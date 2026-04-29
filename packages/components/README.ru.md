# @ytsaurus/components

[English](README.md) | **Русский**

Библиотека **базовых React-компонентов** для интерфейсов вокруг YTsaurus

---

## Установка

Обратите внимание что пакет нужно ставить вместе с **peer-зависимостями**:

```bash
npm install @ytsaurus/components
```

Версии: `react` / `react-dom` ≥ 16.8, `@gravity-ui/uikit` ≥ 7, `@gravity-ui/icons` ≥ 2, `@gravity-ui/table` ≥ 1, `@gravity-ui/date-utils` ≥ 2 (см. `package.json`).

В приложении необходимо наличие базовых стилей UIKit. Темизация — на стороне приложения:

```ts
import '@gravity-ui/uikit/styles/styles.css';
```

---

## Точки входа

| Импорт | Назначение |
|--------|------------|
| **`@ytsaurus/components`** | Компоненты (`ColumnCell`, `MetaTable`, …), типы, хуки (`useNavigationTableData`), **HTTP-API** для навигации (см. ниже). |
| **`@ytsaurus/components/modules`** | Оболочка **`NavigationTable`** и вкладки **`SchemaTab`**, **`PreviewTab`** (типы `NavigationTableProps` и т.д.). |

Корневой entry реэкспортирует модуль **`src/api`**: удобная точка для загрузки данных таблицы и обёртки над YT API.

---

## API для работы с таблицей и кластером

В исходниках пакета всё собрано в **`src/api/index.ts`**:

- **`loadTableAttributesByPath`** — по пути к таблице загружает атрибуты и строки, возвращает объект данных для вкладок (схема, превью, мета).
- **`loadFolderByPath`**, **`loadNodeByPath`** — загрузка узлов навигации по пути.
- **`ytApiV3`** — доступ к низкоуровневому клиенту YT v3 (из `@ytsaurus/javascript-wrapper`).

После установки импортируйте из корня пакета:

```ts
import {
  loadTableAttributesByPath,
  loadFolderByPath,
  loadNodeByPath,
  ytApiV3,
} from '@ytsaurus/components';
```

Тип **`YTApiSetup`** и сигнатуры функций смотрите в типах пакета (`build/esm` после сборки) или в **`src/api/navigation/*.ts`**.

---

## Модуль `NavigationTable`

Реализация: **`src/modules/NavigationTable`**. В npm:

```ts
import { NavigationTable } from '@ytsaurus/components/modules';
```

Компонент **презентационный**: ему передают уже загруженные данные (`table`), опционально фильтр по колонкам схемы, колбэки и настройки YSON для превью. Пустое `table` — показывается `emptyMessage`.

### Простой пример

Ниже — загрузка данных через **`loadTableAttributesByPath`** и отображение **`NavigationTable`**. Параметры `setup` и `options` замените на свои (прокси кластера, лимиты, пользователь и т.д.); это только форма кода.

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
                    proxy: 'https://your-yt-proxy.example/', // см. YTApiSetup
                    // requestHeaders, JSONSerializer, … при необходимости
                },
                {
                    clusterId: 'my_cluster',
                    login: 'robot-user',
                    limit: 100,
                    cellSize: 256,
                    useYqlTypes: true,
                    showDecoded: false,
                    // docsUrls, navigationTableConfig — см. типы опций
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
                emptyMessage="Выберите таблицу или загрузите данные"
            />
        </ThemeProvider>
    );
}
```

Развёрнутая интеграция с Redux, `navigationTableConfig` и ссылками на документацию — в **`packages/ui`** (например, экшены query-tracker и конфиг меты для `MetaTable`).

---

## Хук `useNavigationTableData`

Если удобнее самим описать загрузку по пути, можно использовать **`useNavigationTableData`** из **`@ytsaurus/components`** с адаптером **`NavigationTableDataAdapter`** и по-прежнему рендерить **`NavigationTable`** из **`@ytsaurus/components/modules`**. См. типы в **`src/hooks/useNavigationTableData.ts`**.

---

## Сборка пакета

Из каталога **`packages/components`**:

```bash
npm run build
```

Артефакты: **`build/esm/`** (поля `main` / `exports` / `types` в `package.json`).

---

## Storybook

Локально: **`npm run storybook`** (порт **6006**). Если после **`npm run build:storybook`** в каталоге появился **`storybook-static`**, при dev возможны лишние перезагрузки Vite — каталог игнорируется в **`.storybook/main.ts`**, при сбоях можно удалить **`node_modules/.cache/storybook`**.

---

## Тема `theme-default.scss`

Файл **`theme-default/theme-default.scss`** в корне пакета используется **Storybook** и **Playwright** в этом репозитории и **не входит** в опубликованный npm-архив (`files` в `package.json`). В своём приложении настройте тему Gravity UI самостоятельно.
