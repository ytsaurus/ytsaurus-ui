import React from 'react';
import {useThemeType} from '@gravity-ui/uikit';

import {getSerieColor} from '../constants/colors';

/**
 * React hook that returns a `getSerieColor` bound to the currently
 * active UI theme. The returned function's identity changes whenever
 * the theme changes, so consumers should add it to their `useMemo` /
 * `useEffect` dependency lists to recompute chart data with the new
 * colors on theme switch.
 */
export const useSerieColor = (): ((index: number) => string) => {
    const theme = useThemeType();
    return React.useCallback((index: number) => getSerieColor(index, theme), [theme]);
};
