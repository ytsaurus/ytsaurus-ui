import React from 'react';
import {NodeProgress} from '../../models/plan';
import {getCssColor} from '../../../../../utils/get-css-color';
import CirclePlayIcon from '@gravity-ui/icons/svgs/circle-play.svg';
import CircleCheckIcon from '@gravity-ui/icons/svgs/circle-check.svg';
import CircleXmarkIcon from '@gravity-ui/icons/svgs/circle-xmark.svg';
import CircleMinusIcon from '@gravity-ui/icons/svgs/circle-minus.svg';
import {iconToBase} from '../../../../../components/YTGraph/utils/iconToBase';

const iconCache = new Map<string, string>();

function getCachedIcon(
    IconComponent: React.FC<React.SVGProps<SVGSVGElement>>,
    color: string,
    cacheKey: string,
): string {
    const fullKey = `${cacheKey}-${color}`;
    if (!iconCache.has(fullKey)) {
        const icon = iconToBase(<IconComponent />, color);
        iconCache.set(fullKey, icon);
        return icon;
    } else {
        return iconCache.get(fullKey) as string;
    }
}

type BaseState = {
    icon?: string;
    borderType: 'solid' | 'dashed';
    borderColor: string;
    backgroundColor?: string;
};

type ProgressState = BaseState & {
    progressColors: {
        progress: string;
        progressBorder: string;
    };
};

export const isProgressState = (state: BaseState | ProgressState): state is ProgressState =>
    'progressColors' in state;

export const getBlockTypeByState = (state: NodeProgress['state']): BaseState | ProgressState => {
    switch (state) {
        case 'Started':
            return {
                icon: undefined,
                borderType: 'solid',
                borderColor: getCssColor('--g-color-text-misc-heavy'),
                backgroundColor: getCssColor('--g-color-base-misc-light'),
            };
        case 'InProgress': {
            return {
                icon: getCachedIcon(
                    CirclePlayIcon,
                    getCssColor('--g-color-text-info'),
                    'InProgress',
                ),
                borderType: 'solid',
                borderColor: getCssColor('--g-color-line-generic'),
                backgroundColor: getCssColor('--g-color-line-generic'),
                progressColors: {
                    progress: getCssColor('--g-color-base-positive-light'),
                    progressBorder: getCssColor('--g-color-text-positive-heavy'),
                },
            };
        }
        case 'Finished': {
            const borderColor = getCssColor('--g-color-text-positive-heavy');
            return {
                icon: getCachedIcon(CircleCheckIcon, borderColor, 'Finished'),
                borderType: 'solid',
                borderColor,
                backgroundColor: getCssColor('--g-color-base-positive-light'),
            };
        }
        case 'Failed': {
            const borderColor = getCssColor('--g-color-text-danger-heavy');
            return {
                icon: getCachedIcon(CircleXmarkIcon, borderColor, 'Failed'),
                borderType: 'solid',
                borderColor,
                backgroundColor: getCssColor('--g-color-base-danger-light'),
            };
        }
        case 'Aborted': {
            const borderColor = getCssColor('--g-color-text-complementary');
            return {
                icon: getCachedIcon(CircleMinusIcon, borderColor, 'Aborted'),
                borderType: 'solid',
                borderColor,
                backgroundColor: getCssColor('--g-color-base-generic'),
            };
        }
        default:
            return {
                icon: undefined,
                borderType: 'solid',
                borderColor: getCssColor('--g-color-text-complementary'),
                backgroundColor: undefined,
            };
    }
};
