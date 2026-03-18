import React from 'react';
import {DataTableYT, DataTableYtProps} from '@ytsaurus/components';
import {useScrollableElementContenxt} from '../../hooks/use-scrollable-element';

export function DataTableYTWithScroll<T>({settings, ...props}: DataTableYtProps<T>) {
    const scrollableElement = useScrollableElementContenxt();

    const settingsWithScrollableElement = React.useMemo(() => {
        return Boolean(scrollableElement) && settings?.dynamicRender
            ? ({
                  ...settings,
                  dynamicRenderScrollParentGetter: () =>
                      scrollableElement ?? (document.body as any),
              } as typeof settings)
            : settings;
    }, [settings, scrollableElement]);

    return <DataTableYT<T> {...props} settings={settingsWithScrollableElement} />;
}
