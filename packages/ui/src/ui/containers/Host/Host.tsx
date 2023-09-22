import React from 'react';
import {useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {getCluster} from '../../store/selectors/global';
import Link from '../../components/Link/Link';
import ClipboardButton from '../../components/ClipboardButton/ClipboardButton';
import {Tooltip} from '../../components/Tooltip/Tooltip';
import {uiSettings} from '../../config';

import './Host.scss';

function makeRegexpFromSettings() {
    try {
        return new RegExp(uiSettings.reShortNameFromAddress!);
    } catch {
        return undefined;
    }
}

const reShortName = makeRegexpFromSettings();

function calcShortNameByRegExp(address: string) {
    if (reShortName) {
        const res = reShortName?.exec(address);
        if (res?.groups?.shortname) {
            return [res.groups.shortname, res.groups.suffix].filter(Boolean).join('');
        }
    }
    return undefined;
}

function calcShortNameByMinus(address: string) {
    const first = address.indexOf('-');
    const second = address.indexOf('-', first + 1);
    const res = address.substring(0, second);
    if (res.length) {
        return res;
    }
    const dotIndex = address.indexOf('.');
    return dotIndex === -1 ? address : address.substring(0, dotIndex);
}

const block = cn('yt-host');

interface Props {
    address: string;
    className?: string;
    copyBtnClassName?: string;
    onClick?: () => void;
    useText?: boolean;
    allowByRegexp?: boolean;
    prefix?: React.ReactNode;
}

export function Host({address = '', prefix, className, copyBtnClassName, onClick, useText}: Props) {
    const host = React.useMemo(() => {
        return calcShortNameByRegExp(address) || calcShortNameByMinus(address);
    }, [address]);

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
            <Tooltip content={address}>
                {useText ? (
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
