import React from 'react';
import {useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {getCluster} from '../../store/selectors/global';
import Link from '../../components/Link/Link';
import ClipboardButton from '../../components/ClipboardButton/ClipboardButton';
import {Tooltip} from '../../components/Tooltip/Tooltip';

import './Host.scss';

const block = cn('yt-host');

interface Props {
    address: string;
    className?: string;
    copyBtnClassName?: string;
    asText?: boolean;
    prefix?: React.ReactNode;
}

export function Host({address = '', prefix, className, asText, copyBtnClassName}: Props) {
    const host = React.useMemo(() => {
        const first = address.indexOf('-');
        const second = address.indexOf('-', first + 1);
        const res = address.substring(0, second);
        if (res.length) {
            return res;
        }
        const dotIndex = address.indexOf('.');
        return dotIndex === -1 ? address : address.substring(0, dotIndex);
    }, [address]);

    const cluster = useSelector(getCluster);

    return (
        <span className={block({hidden: !host}, className)}>
            {prefix}
            <Tooltip content={address}>
                {asText ? (
                    host
                ) : (
                    <Link url={`/${cluster}/components/nodes/${address}`}>{host}</Link>
                )}
            </Tooltip>
            <span className={block('copy-btn', copyBtnClassName)}>
                <ClipboardButton view={'flat-secondary'} text={address} />
            </span>
        </span>
    );
}
