import React from 'react';
import Link from '../../components/Link/Link';
import {AccountsTab} from '../../constants/accounts/accounts';
import {Page} from '../../constants';
import {useSelector} from 'react-redux';
import {getCluster} from '../../store/selectors/global';
import hammer from '../../common/hammer';
import {Tooltip} from '../../components/Tooltip/Tooltip';
import ClipboardButton from '../../components/ClipboardButton/ClipboardButton';

interface Props {
    className?: string;
    account?: string;
    cluster?: string;

    inline?: boolean;
}

export function genAccountsUrl(cluster: string, account: string) {
    return `/${cluster}/${Page.ACCOUNTS}/${AccountsTab.GENERAL}?account=${account}`;
}

export default function AccountLink(props: Props) {
    const {cluster: propsCluster, account, className, inline} = props;
    const currentCluster = useSelector(getCluster);
    const cluster = propsCluster || currentCluster;

    return (
        <Tooltip
            ellipsis={inline}
            className={className}
            content={
                !account ? null : (
                    <>
                        <ClipboardButton text={account} view="flat-secondary" /> {account}
                    </>
                )
            }
        >
            {account ? (
                <Link theme={'primary'} routed url={genAccountsUrl(cluster, account)}>
                    {account}
                </Link>
            ) : (
                hammer.format.NO_VALUE
            )}
        </Tooltip>
    );
}
