import {getCssColor} from '../../../utils/get-css-color';

export const getColorByState = (state: string) => {
    switch (state) {
        case 'waiting': {
            return getCssColor('--default-color');
        }
        case 'running': {
            return getCssColor('--info-color');
        }
        case 'aborting': {
            return getCssColor('--g-color-base-misc-heavy');
        }
        case 'aborted': {
            return getCssColor('--g-color-base-misc-heavy');
        }
        case 'completed': {
            return getCssColor('--success-color');
        }
        case 'failed': {
            return getCssColor('--danger-color');
        }
        case 'lost': {
            return getCssColor('--warning-color');
        }
        default: {
            return getCssColor('--g-progress-filled-background-color');
        }
    }
};
