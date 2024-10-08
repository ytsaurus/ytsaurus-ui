import {NodeProgress} from '../../models/plan';
import {Stack} from '@gravity-ui/uikit';
import {JOBS_COLOR_MAP} from '../constants';

export const makeJobsScope = (total: number, progress: NodeProgress): Stack[] => {
    if (!progress.total) return [];
    const percent = total / 100;

    return (Object.keys(JOBS_COLOR_MAP) as Array<keyof typeof JOBS_COLOR_MAP>).reduce<Stack[]>(
        (acc, key) => {
            if (key in progress) {
                let value = progress[key] || 0;
                if (key === 'pending') value += progress.running || 0;
                if (!value) return acc;
                acc.push({color: JOBS_COLOR_MAP[key], value: value / percent});
            }
            return acc;
        },
        [],
    );
};
