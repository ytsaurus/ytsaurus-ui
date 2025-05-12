import React from 'react';
import {useSelector} from 'react-redux';
import {Button, Flex, Select} from '@gravity-ui/uikit';
import {Plus} from '@gravity-ui/icons';

import map_ from 'lodash/map';
import filter_ from 'lodash/filter';
import concat_ from 'lodash/concat';

import {useFetchBatchQuery} from '../../../../store/api/yt';
import {getFavouriteAccounts} from '../../../../store/selectors/favourites';
import {getCurrentUserName} from '../../../../store/selectors/global';

import {DialogControlProps} from '../../../../components/Dialog/Dialog.types';

import ypath from '../../../../common/thor/ypath';

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
        errorTitle: 'Failed to fetch accounts list',
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
        ? map_(filter_(ypath.getValue(accounts[0].output), Boolean), (item) => ({
              value: item,
              content: item,
          }))
        : [];

    const addFavorite = () => {
        const currentValue = value.length && value[0] !== '' ? [...value] : [];
        onChange(
            concat_(
                currentValue,
                map_(favourites, ({path}) => path),
            ),
        );
    };

    const addUsable = () => {
        const currentValue = value.length && value[0] !== '' ? [...value] : [];
        onChange(concat_(currentValue, usableAccounts));
    };

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
                <Button size={'m'} onClick={addFavorite}>
                    <Flex alignItems={'center'} gap={2}>
                        <Plus />
                        Favourites
                    </Flex>
                </Button>
                <Button size={'m'} onClick={addUsable}>
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
    return [];
};
