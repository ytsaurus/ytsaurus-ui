import {autoIcons} from './auto-imported-icons';

const manualIcons = {};

/**
 * Do not remove the variable it is required to find duplicates in manualIcons by typescript compiler
 */
// @ts-ignore
const __duplicatesError__: Partial<Record<keyof typeof autoIcons, never>> & typeof manualIcons =
    manualIcons;

export const iconNames = {...autoIcons, ...manualIcons};
