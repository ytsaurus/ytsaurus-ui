import React from 'react';
import {useSelector} from 'react-redux';
import {Button, Flex, Select} from '@gravity-ui/uikit';
import {Plus} from '@gravity-ui/icons';

import map_ from 'lodash/map';
import filter_ from 'lodash/filter';
import concat_ from 'lodash/concat';

import {useFetchBatchQuery} from '../../../../store/api/yt';
import {useUsableAccountsQuery} from '../../../../store/api/accounts';
import {getFavouriteAccounts} from '../../../../store/selectors/favourites';

import {DialogControlProps} from '../../../../components/Dialog/Dialog.types';

import ypath from '../../../../common/thor/ypath';

import {YTApiId} from '../../../../../shared/constants/yt-api-id';
import {USE_CACHE, USE_MAX_SIZE} from '../../../../../shared/constants/yt-api';

type Props = DialogControlProps<string[]> & {
    disabled?: boolean;
};

export function AccountsMultiple(props: Props) {
    const {value, onChange} = props;

    const favourites = useSelector(getFavouriteAccounts);

    const {data: accounts, isLoading} = useFetchBatchQuery<string>({
        parameters: {
            requests: [
                {
                    command: 'list' as const,
                    parameters: {
                        path: `//sys/accounts`,
                        ...USE_MAX_SIZE,
                        ...USE_CACHE,
                    },
                },
            ],
        },
        id: YTApiId.listAccounts,
        errorTitle: 'Failed to fetch accounts list',
    });

    const {data: usableAccounts} = useUsableAccountsQuery(undefined);

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
        onChange(concat_(currentValue, usableAccounts || []));
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
