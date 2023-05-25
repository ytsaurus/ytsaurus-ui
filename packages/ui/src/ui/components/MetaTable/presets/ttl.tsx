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

const block = cn('meta-table-ttl');

export function makeTTLItems(attrs: unknown, {showTTLLabel}: {showTTLLabel?: false} = {}) {
    const expiration_time = ypath.getValue(attrs, '/expiration_time');
    const expiration_timeout = ypath.getValue(attrs, '/expiration_timeout');

    const res: Array<MetaTableItem> = [];

    const className = block('ttl');

    if (expiration_time) {
        res.push({
            key: 'expiration_time',
            value: withTTL(moment(expiration_time).format('DD MMM YYYY HH:mm:ss'), showTTLLabel),
            className,
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
