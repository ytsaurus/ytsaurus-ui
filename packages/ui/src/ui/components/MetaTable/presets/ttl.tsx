import React from 'react';
import moment from 'moment';
import cn from 'bem-cn-lite';

import {Label, LabelProps} from '@gravity-ui/uikit';

import ypath from '../../../common/thor/ypath';

import {formatTimeDuration} from '../../../components/TimeDuration/TimeDuration';
import Link from '../../../components/Link/Link';
import Icon from '../../../components/Icon/Icon';
import UIFactory from '../../../UIFactory';

import {MetaTableItem} from '../MetaTable';
import {Template} from '../templates/Template';
import {makeNavigationLink} from '../../../utils/app-url';

const block = cn('meta-table-ttl');

export function makeTTLItems(attrs: unknown, {showTTLLabel}: {showTTLLabel?: false} = {}) {
    const expiration_time = ypath.getValue(attrs, '/expiration_time');
    const expiration_timeout = ypath.getValue(attrs, '/expiration_timeout');
    const {time, timeout} = ypath.getValue(attrs, '/effective_expiration') ?? {};

    const res: Array<MetaTableItem> = [];

    const className = block('ttl');

    if (time && time.value !== expiration_time) {
        res.push({
            key: 'effective_expiration_time',
            value: withTTL(moment(time.value).format('DD MMM YYYY HH:mm:ss'), showTTLLabel),
            className,
        });
        res.push({
            key: 'effective_expiration_time_path',
            qa: 'expiration_timeout_path',
            value: <Template.Link url={makeNavigationLink({path: time.path})} text={time.path} />,
        });
    }
    if (expiration_time) {
        res.push({
            key: 'expiration_time',
            value: withTTL(moment(expiration_time).format('DD MMM YYYY HH:mm:ss'), showTTLLabel),
            className,
        });
    }

    if (timeout && timeout.value !== expiration_timeout) {
        res.push({
            key: 'effective_expiration_timeout',
            value: withTTL(formatTimeDuration(timeout.value), showTTLLabel),
            className,
        });
        res.push({
            key: 'effective_expiration_timeout_path',
            qa: 'expiration_timeout_path',
            value: (
                <Template.Link url={makeNavigationLink({path: timeout.path})} text={timeout.path} />
            ),
        });
    }
    if (expiration_timeout) {
        res.push({
            key: 'expiration_timeout',
            value: withTTL(formatTimeDuration(expiration_timeout), showTTLLabel),
            className,
        });
    }

    return res;
}

function withTTL(children: React.ReactNode, showTTLLabel = false) {
    return (
        <React.Fragment>
            {children}{' '}
            <Link
                className={block('ttl-info')}
                url={UIFactory.docsUrls['cypress:ttl']}
                theme="secondary"
            >
                <Icon awesome={'question-circle'} />
            </Link>{' '}
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
