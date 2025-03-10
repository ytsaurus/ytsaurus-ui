import {getColor} from '../../../../../query-tracker/Plan/GraphEditor/helpers/getColor';

export const getColorByState = (state: string) => {
    switch (state) {
        case 'waiting': {
            return getColor('--default-color');
        }
        case 'running': {
            return getColor('--info-color');
        }
        case 'aborting': {
            return getColor('--g-color-base-neutral-medium');
        }
        case 'aborted': {
            return getColor('--g-color-base-neutral-medium');
        }
        case 'completed': {
            return getColor('--success-color');
        }
        case 'failed': {
            return getColor('--danger-color');
        }
        case 'lost': {
            return getColor('--warning-color');
        }
        default: {
            return getColor('--g-progress-filled-background-color');
        }
    }
};
