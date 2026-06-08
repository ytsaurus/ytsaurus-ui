import hammer from '../../common/hammer';
import {defaultThemeThresholds, getProgressTheme} from '../progress';
import i18n from './i18n';
import {type ProgressTheme, type Stack} from '@gravity-ui/uikit';

interface DiskSpaceProgressInput {
    used: number;
    systemReserved?: number;
    uncommitted?: number;
    total: number;
}

export interface TooltipInfoItem {
    value: string | number;
    title?: string;
    theme?: ProgressTheme;
    color?: string;
    isTotal?: boolean;
}

interface DiskSpaceProgressOutput {
    text: string;
    stack: Stack[];
    tooltipInfo: TooltipInfoItem[];
}

export function calculateUncommittedDiskSpacePerMedium(
    totalUsage: Record<string, number>,
    committedUsage: Record<string, number>,
): Record<string, number> {
    const uncommittedDiskSpacePerMedium: Record<string, number> = {};

    Object.keys(totalUsage).forEach((medium) => {
        uncommittedDiskSpacePerMedium[medium] =
            (totalUsage[medium] ?? 0) - (committedUsage[medium] ?? 0);
    });

    return uncommittedDiskSpacePerMedium;
}

export interface ApiResponse {
    output?: Record<string, number>;
}

export function calculateAndDispatchUncommittedDiskSpace(
    recursiveUsage?: ApiResponse | Record<string, number>,
    recursiveCommittedUsage?: ApiResponse | Record<string, number>,
): Record<string, number> {
    const usageData = recursiveUsage?.output ?? recursiveUsage;
    const committedData = recursiveCommittedUsage?.output ?? recursiveCommittedUsage;

    return usageData && committedData
        ? calculateUncommittedDiskSpacePerMedium(
              usageData as Record<string, number>,
              committedData as Record<string, number>,
          )
        : {};
}

export function calculateDiskSpaceProgress(input: DiskSpaceProgressInput): DiskSpaceProgressOutput {
    const {used, systemReserved = 0, uncommitted = 0, total} = input;
    const formatBytes = hammer.format['Bytes'];

    const hasReserve = systemReserved > 0 && total > 0;
    const hasUncommitted = uncommitted > 0 && total > 0;

    const textParts = [formatBytes(used)];
    if (hasReserve) textParts.push(formatBytes(systemReserved));
    if (hasUncommitted) textParts.push(formatBytes(uncommitted));
    const text = `${textParts.join(' + ')} / ${formatBytes(total)}`;

    const totalUsed = used + (hasReserve ? systemReserved : 0) + (hasUncommitted ? uncommitted : 0);

    const stack: Stack[] = [];
    const tooltipInfo: TooltipInfoItem[] = [];

    if (hasReserve) {
        const systemReservedInfo: Stack = {
            value: (systemReserved / total) * 100,
            color: 'var(--g-color-base-info-heavy)',
            title: i18n('tooltip_system-reserved'),
        };

        stack.push(systemReservedInfo);
        tooltipInfo.push({
            ...systemReservedInfo,
            value: formatBytes(systemReserved),
        });
    }

    const clusterUsageTheme = getProgressTheme((totalUsed / total) * 100, defaultThemeThresholds);
    const clusterUsageInfo: Stack = {
        value: (used / total) * 100,
        theme: clusterUsageTheme,
        title: i18n('tooltip_committed'),
    };

    stack.push(clusterUsageInfo);
    tooltipInfo.push({
        ...clusterUsageInfo,
        value: formatBytes(used),
    });

    if (hasUncommitted) {
        const uncommittedInfo: Stack = {
            value: (uncommitted / total) * 100,
            color: 'var(--g-color-base-neutral-heavy)',
            title: i18n('tooltip_uncommitted'),
        };
        stack.push(uncommittedInfo);
        tooltipInfo.push({
            ...uncommittedInfo,
            value: formatBytes(uncommitted),
        });
    }

    return {
        text,
        stack,
        tooltipInfo: [
            ...tooltipInfo,
            {
                value: `${formatBytes(used + (hasUncommitted ? uncommitted : 0) + (hasReserve ? systemReserved : 0))} / ${formatBytes(total)}`,
                title: i18n('tooltip_total'),
                isTotal: true,
            },
        ],
    };
}
