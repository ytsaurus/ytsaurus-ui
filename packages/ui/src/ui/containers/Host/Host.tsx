import React from 'react';
import {useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {getCluster} from '../../store/selectors/global';
import Link from '../../components/Link/Link';
import ClipboardButton from '../../components/ClipboardButton/ClipboardButton';
import {Tooltip} from '../../components/Tooltip/Tooltip';
import {uiSettings} from '../../config/ui-settings';

import './Host.scss';

function makeRegexpFromSettings(value?: string) {
    try {
        return new RegExp(value!);
    } catch {
        return undefined;
    }
}

const reShortName = makeRegexpFromSettings(uiSettings.reShortNameFromAddress);
const reTabletNodeShortName = makeRegexpFromSettings(uiSettings.reShortNameFromTabletNodeAddress);

function calcShortNameByRegExp(address: string, asTabletNode?: boolean) {
    const re = asTabletNode ? reTabletNodeShortName : reShortName;
    if (re) {
        const res = re?.exec(address);
        if (res?.groups?.shortname) {
            return [res.groups.shortname, res.groups.suffix].filter(Boolean).join('');
        }
    }
    return undefined;
}

const block = cn('yt-host');

interface Props {
    address: string;
    className?: string;
    copyBtnClassName?: string;
    onClick?: () => void;
    useText?: boolean;
    prefix?: React.ReactNode;
    asTabletNode?: boolean;
}

export function Host({
    address = '',
    prefix,
    className,
    copyBtnClassName,
    onClick,
    useText,
    asTabletNode,
}: Props) {
    const host = React.useMemo(() => {
        return calcShortNameByRegExp(address, asTabletNode) || address;
    }, [address, asTabletNode]);

    const cluster = useSelector(getCluster);

    return (
        <span
            className={block(
                {hidden: !host},
                ['elements-monospace', className].filter(Boolean).join(' '),
            )}
            onClick={onClick}
        >
            {prefix}
            <Tooltip className={block('tooltip')} content={address}>
                {useText ? (
                    host
                ) : (
                    <Link url={`/${cluster}/components/nodes/${address}`} routed>
                        {host}
                    </Link>
                )}
            </Tooltip>
            <span className={block('copy-btn', copyBtnClassName)}>
                <ClipboardButton view={'flat-secondary'} text={address} />
            </span>
        </span>
    );
}
