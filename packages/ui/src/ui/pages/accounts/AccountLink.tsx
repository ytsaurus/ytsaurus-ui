import React from 'react';
import Link from '../../components/Link/Link';
import {AccountsTab} from '../../constants/accounts/accounts';
import {Page} from '../../constants';
import {useSelector} from 'react-redux';
import {getCluster} from '../../store/selectors/global';

interface Props {
    account: string;
    cluster?: string;
}

export function genAccountsUrl(cluster: string, account: string) {
    return `/${cluster}/${Page.ACCOUNTS}/${AccountsTab.GENERAL}?account=${account}`;
}

export default function AccountLink(props: Props) {
    const {cluster: propsCluster, account} = props;
    const currentCluster = useSelector(getCluster);
    const cluster = propsCluster || currentCluster;
    return (
        <Link theme={'primary'} routed url={genAccountsUrl(cluster, account)}>
            {account}
        </Link>
    );
}
