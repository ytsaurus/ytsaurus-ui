import cn from 'bem-cn-lite';
import React from 'react';
import {useSelector} from 'react-redux';
import hammer from '../../common/hammer';
import ClipboardButton from '../../components/ClipboardButton/ClipboardButton';
import Link from '../../components/Link/Link';
import {Tooltip} from '../../components/Tooltip/Tooltip';
import {Page} from '../../constants';
import {AccountsTab} from '../../constants/accounts/accounts';
import {getCluster} from '../../store/selectors/global';
import './AccountLink.scss';

const block = cn('account-link');

interface Props {
    className?: string;
    account?: string;
    cluster?: string;
}

export function genAccountsUrl(cluster: string, account: string) {
    return `/${cluster}/${Page.ACCOUNTS}/${AccountsTab.GENERAL}?account=${account}`;
}

export default function AccountLink(props: Props) {
    const {cluster: propsCluster, account, className} = props;
    const currentCluster = useSelector(getCluster);
    const cluster = propsCluster || currentCluster;

    return (
        <Tooltip
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
                <Link
                    className={block()}
                    theme={'primary'}
                    routed
                    url={genAccountsUrl(cluster, account)}
                >
                    {account}
                </Link>
            ) : (
                hammer.format.NO_VALUE
            )}
        </Tooltip>
    );
}
