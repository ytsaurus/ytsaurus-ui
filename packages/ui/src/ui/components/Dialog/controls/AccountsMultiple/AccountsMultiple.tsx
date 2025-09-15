import React from 'react';
import {useSelector} from '../../../../store/redux-hooks';
import {Button, Flex, Label, Select} from '@gravity-ui/uikit';

import map_ from 'lodash/map';
import filter_ from 'lodash/filter';

import {useFetchBatchQuery} from '../../../../store/api/yt';
import {useUsableAccountsQuery} from '../../../../store/api/accounts';
import {getFavouriteAccounts} from '../../../../store/selectors/favourites';
import {getCluster} from '../../../../store/selectors/global';

import {DialogControlProps} from '../../../../components/Dialog/Dialog.types';

import ypath from '../../../../common/thor/ypath';

import {YTApiId} from '../../../../../shared/constants/yt-api-id';
import {USE_CACHE, USE_MAX_SIZE} from '../../../../../shared/constants/yt-api';

import i18n from './i18n';

type Props = DialogControlProps<string[]> & {
    disabled?: boolean;
};

export function AccountsMultiple(props: Props) {
    const {value, onChange} = props;

    const favourites = useSelector(getFavouriteAccounts);
    const cluster = useSelector(getCluster);

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
        errorTitle: i18n('toaster_failed-fetch-accounts'),
    });

    const {data: usableAccounts} = useUsableAccountsQuery({cluster});

    const accountsLoadedWithData = accounts && accounts.length && accounts[0].output;

    const options = accountsLoadedWithData
        ? map_(filter_(ypath.getValue(accounts[0].output), Boolean), (item) => ({
              value: item,
              content: item,
          }))
        : [];

    const setFavorite = () => {
        onChange(map_(favourites, ({path}) => path));
    };

    const setUsable = () => {
        onChange(usableAccounts || []);
    };

    const onDelete = (deleted: string) => {
        onChange(value.filter((item) => item !== deleted));
    };

    return (
        <Flex gap={1} direction={'column'}>
            <Flex gap={1} direction={'column'}>
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
                <div>{value?.length ? <ItemsList items={value} onDelete={onDelete} /> : null}</div>
            </Flex>
            <div>
                <Flex direction={'row'} gap={1}>
                    <Button size={'m'} onClick={setFavorite}>
                        <Flex alignItems={'center'} gap={2}>
                            {i18n('action_favourite')}
                        </Flex>
                    </Button>
                    <Button size={'m'} onClick={setUsable}>
                        <Flex alignItems={'center'} gap={2}>
                            {i18n('action_usable')}
                        </Flex>
                    </Button>
                </Flex>
            </div>
        </Flex>
    );
}

function ItemsList({items, onDelete}: {items: string[]; onDelete: (item: string) => void}) {
    return (
        <Flex gap={1} wrap={'wrap'}>
            {items.map((item) => (
                <Item item={item} onDelete={onDelete} key={item} />
            ))}
        </Flex>
    );
}

function Item({item, onDelete}: {item: string; onDelete: (item: string) => void}) {
    return (
        <Label theme={'unknown'} type={'close'} size={'xs'} onCloseClick={() => onDelete(item)}>
            {item}
        </Label>
    );
}

AccountsMultiple.isEmpty = (value: string[]) => {
    return !value;
};

AccountsMultiple.getDefaultValue = () => {
    return [];
};
