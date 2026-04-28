import React from 'react';
import {useThemeType} from '@gravity-ui/uikit';

import {getSerieColor} from '../constants/colors';

export const useSerieColor = (): ((index: number) => string) => {
    const theme = useThemeType();

    return React.useCallback((index: number) => getSerieColor(index, theme), [theme]);
};
