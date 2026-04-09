import React from 'react';
import {dateTime} from '@gravity-ui/date-utils';
import cn from 'bem-cn-lite';

import {Icon, Label, LabelProps, Link} from '@gravity-ui/uikit';
import CircleQuestionIcon from '@gravity-ui/icons/svgs/circle-question.svg';

import {ypath} from '../../../utils';

import {MetaTableItem} from '../MetaTable';
import {Template} from '../templates/Template';
import type {YtComponentsConfig} from '../../../context';
import {formatTimeDuration} from './helpers/formatTimeDuration';

import './ttl.scss';

const block = cn('meta-table-ttl');

export function makeTTLItems(
    attrs: unknown,
    {
        showTTLLabel,
        docsUrls,
        cluster,
        config,
    }: {
        showTTLLabel?: boolean;
        docsUrls?: Record<string, string>;
        cluster?: string;
        config?: Partial<YtComponentsConfig>;
    } = {},
) {
    const expirationTime = ypath.getValue(attrs, '/expiration_time');
    const expirationTimeout = ypath.getValue(attrs, '/expiration_timeout');
    const {time, timeout} = ypath.getValue(attrs, '/effective_expiration') ?? {};

    const res: Array<MetaTableItem> = [];
    const className = block('ttl');
    if (time && time.value !== expirationTime) {
        res.push({
            key: 'effective_expiration_time',
            value: withTTL(
                dateTime({input: time.value}).format('DD MMM YYYY HH:mm:ss'),
                showTTLLabel,
                docsUrls,
            ),
            className,
        });
        const timePathUrl = config?.navigationLinkTemplate?.({cluster, path: time.path});
        res.push({
            key: 'effective_expiration_time_path',
            qa: 'expiration_timeout_path',
            value: timePathUrl ? <Template.Link url={timePathUrl} text={time.path} /> : time.path,
        });
    }
    if (expirationTime) {
        res.push({
            key: 'expiration_time',
            value: withTTL(
                dateTime({input: expirationTime}).format('DD MMM YYYY HH:mm:ss'),
                showTTLLabel,
                docsUrls,
            ),
            className,
        });
    }

    if (timeout && timeout.value !== expirationTimeout) {
        res.push({
            key: 'effective_expiration_timeout',
            value: withTTL(formatTimeDuration(timeout.value), showTTLLabel, docsUrls),
            className,
        });
        const timeoutPathUrl = config?.navigationLinkTemplate?.({cluster, path: timeout.path});
        res.push({
            key: 'effective_expiration_timeout_path',
            qa: 'expiration_timeout_path',
            value: timeoutPathUrl ? (
                <Template.Link url={timeoutPathUrl} text={timeout.path} />
            ) : (
                timeout.path
            ),
        });
    }
    if (expirationTimeout) {
        res.push({
            key: 'expiration_timeout',
            value: withTTL(formatTimeDuration(expirationTimeout), showTTLLabel, docsUrls),
            className,
        });
    }

    return res;
}

function withTTL(
    children: React.ReactNode,
    showTTLLabel = false,
    docsUrls?: Record<string, string>,
) {
    const ttlDocUrl = docsUrls?.['cypress:ttl'] || '';

    return (
        <React.Fragment>
            {children}{' '}
            {ttlDocUrl && (
                <Link className={block('ttl-info')} href={ttlDocUrl} view="secondary">
                    <Icon data={CircleQuestionIcon} size={14} />
                </Link>
            )}{' '}
            {showTTLLabel && <TTLLabel />}
        </React.Fragment>
    );
}

export function TTLLabel({size}: {size?: LabelProps['size']}) {
    return (
        <Label theme={'warning'} size={size}>
            TTL
        </Label>
    );
}
