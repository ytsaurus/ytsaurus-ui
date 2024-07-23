import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import hammer from '../../common/hammer';

import reduce_ from 'lodash/reduce';

function getNetworkResourceText(resourceUsage, resourceLimit) {
    return hammer.format['Percent']((resourceUsage / resourceLimit) * 100);
}

function getMemoryResourceText(resourceUsage, resourceLimit) {
    return hammer.format['Bytes'](resourceUsage) + ' / ' + hammer.format['Bytes'](resourceLimit);
}

function getDefaultResourceText(resourceUsage, resourceLimit) {
    return hammer.format['Number'](resourceUsage) + ' / ' + hammer.format['Number'](resourceLimit);
}

function getResourcesText(data) {
    const resourceUsage = data.usage;
    const resourceLimit = data.limit;

    switch (data.type) {
        case 'network':
            return getNetworkResourceText(resourceUsage, resourceLimit);
        case 'user_memory':
            return getMemoryResourceText(resourceUsage, resourceLimit);
        default:
            return getDefaultResourceText(resourceUsage, resourceLimit);
    }
}

function getResourceProgressValue(data) {
    const resourceUsage = data.usage;
    const resourceLimit = data.limit;

    return (resourceUsage / resourceLimit) * 100;
}

function getResourceProgress(data) {
    return {
        text: getResourcesText(data),
        value: getResourceProgressValue(data),
        theme: 'info',
    };
}

export function prepareResources(data) {
    const resourceUsage = ypath.getValue(data, '/resource_usage');
    const resourceLimits = ypath.getValue(data, '/resource_limits');
    const resourceTypes = ['cpu', 'user_memory', 'user_slots', 'network', 'gpu'];

    return reduce_(
        resourceTypes,
        (res, type) => {
            if (resourceUsage && resourceLimits) {
                const data = {
                    type,
                    usage: Number(ypath.getValue(resourceUsage[type], '')),
                    limit: Number(ypath.getValue(resourceLimits[type], '')),
                };
                const progress = getResourceProgress(data);

                res.push({...data, progress});
            }
            return res;
        },
        [],
    );
}
