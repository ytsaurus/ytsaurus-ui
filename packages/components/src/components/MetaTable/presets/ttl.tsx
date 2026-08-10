import {Fragment, type ReactNode} from 'react';
import {dateTime} from '@gravity-ui/date-utils';
import cn from 'bem-cn-lite';

import {Icon, Label, LabelProps, Link} from '@gravity-ui/uikit';
import CircleQuestionIcon from '@gravity-ui/icons/svgs/circle-question.svg';

import {ypath} from '../../../utils';

import {MetaTableItem} from '../MetaTable';
import {TemplateLink} from '../templates';
import type {TYComponentsNavigationMetaConfig} from '../../../types';
import {formatTimeDuration} from './helpers/formatTimeDuration';
import {LINK_MAX_WIDTH} from './constants';
import i18n from './i18n';

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
        config?: TYComponentsNavigationMetaConfig;
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
            label: i18n('field_effective-expiration-time'),
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
            label: i18n('field_effective-expiration-time-path'),
            qa: 'expiration_time_path',
            value: timePathUrl ? (
                <TemplateLink
                    url={timePathUrl}
                    text={time.path}
                    maxWidth={LINK_MAX_WIDTH}
                    withClipboard
                />
            ) : (
                time.path
            ),
        });
    }
    if (expirationTime) {
        res.push({
            key: 'expiration_time',
            label: i18n('field_expiration-time'),
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
            label: i18n('field_effective-expiration-timeout'),
            value: withTTL(formatTimeDuration(timeout.value), showTTLLabel, docsUrls),
            className,
        });
        const timeoutPathUrl = config?.navigationLinkTemplate?.({cluster, path: timeout.path});
        res.push({
            key: 'effective_expiration_timeout_path',
            label: i18n('field_effective-expiration-timeout-path'),
            qa: 'expiration_timeout_path',
            value: timeoutPathUrl ? (
                <TemplateLink
                    url={timeoutPathUrl}
                    text={timeout.path}
                    maxWidth={LINK_MAX_WIDTH}
                    withClipboard
                />
            ) : (
                timeout.path
            ),
        });
    }
    if (expirationTimeout) {
        res.push({
            key: 'expiration_timeout',
            label: i18n('field_expiration-timeout'),
            value: withTTL(formatTimeDuration(expirationTimeout), showTTLLabel, docsUrls),
            className,
        });
    }

    return res;
}

function withTTL(children: ReactNode, showTTLLabel = false, docsUrls?: Record<string, string>) {
    const ttlDocUrl = docsUrls?.['cypress:ttl'] || '';

    return (
        <Fragment>
            {children}{' '}
            {ttlDocUrl && (
                <Link className={block('ttl-info')} href={ttlDocUrl} view="secondary">
                    <Icon data={CircleQuestionIcon} size={14} />
                </Link>
            )}{' '}
            {showTTLLabel && <TTLLabel />}
        </Fragment>
    );
}

export function TTLLabel({size}: {size?: LabelProps['size']}) {
    return (
        <Label theme={'warning'} size={size}>
            TTL
        </Label>
    );
}
