import {getMetrics} from '../../../common/utils/metrics';

export function trackDescriptionEdit(
    descriptionType: 'yt' | 'external',
    location: 'tab' | 'drawer' | 'empty_state',
) {
    getMetrics().countEvent('navigation_description_edit', {descriptionType, location});
}
