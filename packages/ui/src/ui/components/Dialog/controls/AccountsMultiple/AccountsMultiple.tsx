import React from 'react';
import {useSelector} from 'react-redux';
import {Button, Flex, Select} from '@gravity-ui/uikit';
import {Plus} from '@gravity-ui/icons';

import map_ from 'lodash/map';

import {useFetchBatchQuery} from '../../../../store/api/yt';
import {getFavouriteAccounts} from '../../../../store/selectors/favourites';
import {getCurrentUserName} from '../../../../store/selectors/global';

import {DialogControlProps} from '../../../../components/Dialog/Dialog.types';

import {YTApiId} from '../../../../../shared/constants/yt-api-id';

type Props = DialogControlProps<string[]> & {
    disabled?: boolean;
};

export function AccountsMultiple(props: Props) {
    const {value, onChange} = props;

    const favourites = useSelector(getFavouriteAccounts);
    const username = useSelector(getCurrentUserName);

    const {data: accounts, isLoading} = useFetchBatchQuery<string>({
        parameters: {
            requests: [
                {
                    command: 'list' as const,
                    parameters: {path: `//sys/accounts`},
                },
            ],
        },
        id: YTApiId.listAccounts,
    });

    const {data: usableAccountsData} = useFetchBatchQuery<string>({
        parameters: {
            requests: [
                {
                    command: 'get' as const,
                    parameters: {path: `//sys/users/${username}/@usable_accounts`},
                },
            ],
        },
        id: YTApiId.listAccounts,
    });

    const usableAccounts =
        usableAccountsData && usableAccountsData.length && usableAccountsData[0].output
            ? usableAccountsData[0].output
            : [];

    const accountsLoadedWithData = accounts && accounts.length && accounts[0].output;

    const options = accountsLoadedWithData
        ? map_(accounts[0].output, (item) => ({value: item, content: item}))
        : [];

    return (
        <Flex gap={2} direction={'column'}>
            <Select
                onUpdate={onChange}
                options={options}
                multiple
                popupWidth={'fit'}
                value={value}
                filterable
                hasClear
                width={'max'}
                loading={isLoading}
            />
            <Flex direction={'row'} gap={1}>
                <Button
                    size={'m'}
                    onClick={() => onChange([...value, ...map_(favourites, ({path}) => path)])}
                >
                    <Flex alignItems={'center'} gap={2}>
                        <Plus />
                        Favourites
                    </Flex>
                </Button>
                <Button size={'m'} onClick={() => onChange([...value, ...usableAccounts])}>
                    <Flex alignItems={'center'} gap={2}>
                        <Plus />
                        Usable
                    </Flex>
                </Button>
            </Flex>
        </Flex>
    );
}

AccountsMultiple.isEmpty = (value: string[]) => {
    return !value;
};

AccountsMultiple.getDefaultValue = () => {
    return [''];
};
