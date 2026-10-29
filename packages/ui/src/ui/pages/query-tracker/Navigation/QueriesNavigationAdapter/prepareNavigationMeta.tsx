import React from 'react';
import {type NavigationMetaConfig} from '@gravity-ui/querieskit';
import {type NavigationTable} from '@ytsaurus/components';
import {Icon, Link, Tooltip} from '@gravity-ui/uikit';
import {CircleQuestion} from '@gravity-ui/icons';

import format from '../../../../common/hammer/format';

export function prepareNavigationMeta(
    metadata: NavigationTable['meta'] = [],
): NavigationMetaConfig {
    return {
        groups: metadata.map((items) => ({
            items: items
                .filter(
                    ({visible, value}) =>
                        visible !== false && value !== null && value !== undefined,
                )
                .map(({key, label, value, tooltip, helpUrl, qa}) => ({
                    name:
                        typeof label === 'string' || typeof label === 'number'
                            ? String(label)
                            : format.ReadableField(key),
                    value: (
                        <Tooltip content={tooltip}>
                            <span data-qa={qa}>
                                {typeof value === 'boolean' ? String(value) : value}
                                {helpUrl ? (
                                    <Link
                                        href={helpUrl}
                                        view="secondary"
                                        aria-label={String(label ?? key)}
                                    >
                                        <Icon data={CircleQuestion} size={14} />
                                    </Link>
                                ) : null}
                                {!helpUrl && Boolean(tooltip) && (
                                    <Icon data={CircleQuestion} size={14} />
                                )}
                            </span>
                        </Tooltip>
                    ),
                })),
        })),
    };
}
