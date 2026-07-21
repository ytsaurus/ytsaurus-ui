import React from 'react';

import {COLUMNS} from './constants';

export const useColumns = (hideColumns?: Array<string>) => {
    const res = React.useMemo(() => {
        if (!hideColumns?.length) {
            return COLUMNS;
        }

        const toHide = new Set(hideColumns);
        return COLUMNS.filter((item) => !toHide.has(item.name));
    }, [hideColumns]);
    return res;
};
