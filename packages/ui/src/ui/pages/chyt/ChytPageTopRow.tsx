import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {Alert, Button} from '@gravity-ui/uikit';

import Favourites from '../../components/Favourites/Favourites';
import {YTDFDialog} from '../../components/Dialog/Dialog';
import {Page} from '../../constants';
import {RowWithName} from '../../containers/AppNavigation/TopRowContent/SectionName';
import {PoolTreeLoaderWaitDeafultTree} from '../../hooks/global';
import {getFavouriteChyt, isActiveCliqueInFavourites} from '../../store/selectors/favourites';
import {chytToggleFavourite} from '../../store/actions/favourites';
import {getChytCurrrentClique} from '../../store/selectors/chyt';
import {getCurrentUserName, getGlobalDefaultPoolTreeName} from '../../store/selectors/global';
import {chytCliqueCreate} from '../../store/actions/chyt/list';
import {useThunkDispatch} from '../../store/thunkDispatch';

import './ChytPageTopRow.scss';

const block = cn('chyt-page-top-row');

export default function ChytPageTopRow() {
    return (
        <RowWithName page={Page.CHYT} name="CHYT cliques">
            <ChytFavourites />
            <CreateChytButton />
        </RowWithName>
    );
}

function ChytFavourites() {
    const isActiveInFavourites = useSelector(isActiveCliqueInFavourites);
    const favourites = useSelector(getFavouriteChyt);
    const dispatch = useDispatch();
    const currentClique = useSelector(getChytCurrrentClique);

    const handleFavouriteItemClick = React.useCallback(() => {
        // dispatch(setActiveAccount(item.path));
    }, [dispatch]);

    const handleFavouriteToggle = React.useCallback(() => {
        dispatch(chytToggleFavourite(currentClique));
    }, [dispatch, currentClique]);

    return (
        <Favourites
            isActive={isActiveInFavourites}
            items={favourites}
            onItemClick={handleFavouriteItemClick}
            onToggle={handleFavouriteToggle}
            toggleDisabled={!currentClique}
            theme={'clear'}
        />
    );
}

type FormValues = {
    alias: string;
    instance_count: {value: number};
    instance_cpu: {value: number};
    instance_total_memory: {value: number};
    pool: string;
    runAfterCreation: boolean;
};

const ONE_GB = 1024 * 1024 * 1024;

function CreateChytButton() {
    const dispatch = useThunkDispatch();
    const [visible, setVisible] = React.useState(false);
    const defaultPoolTree = useSelector(getGlobalDefaultPoolTreeName);
    const currentUser = useSelector(getCurrentUserName);

    return (
        <div className={block('create-clique')}>
            <Button view="action" onClick={() => setVisible(!visible)}>
                Create clique
            </Button>
            {visible && (
                <PoolTreeLoaderWaitDeafultTree>
                    <YTDFDialog<FormValues>
                        visible
                        headerProps={{title: 'Create clique'}}
                        onClose={() => setVisible(false)}
                        onAdd={(form) => {
                            const {
                                values: {
                                    instance_count,
                                    instance_cpu,
                                    instance_total_memory,
                                    ...rest
                                },
                            } = form.getState();
                            return dispatch(
                                chytCliqueCreate({
                                    ...rest,
                                    instance_count: instance_count.value,
                                    instance_cpu: instance_cpu.value,
                                    instance_total_memory: instance_total_memory.value,
                                }),
                            );
                        }}
                        fields={[
                            {
                                name: 'alert',
                                type: 'block',
                                extras: {
                                    children: (
                                        <Alert
                                            message={
                                                "The vast majority of ClickHouse's functionality is available in CHYT. " +
                                                'You can get acquainted with the capabilities of ClickHouse in the official documentation.'
                                            }
                                        />
                                    ),
                                },
                            },
                            {
                                name: 'alias',
                                type: 'text',
                                caption: 'Alias name',
                                required: true,
                            },
                            {
                                name: 'instance_count',
                                type: 'number',
                                caption: 'Instance count',
                                extras: {
                                    min: 1,
                                    max: 100,
                                    hidePrettyValue: true,
                                    showHint: true,
                                },
                                required: true,
                            },
                            {
                                name: 'instance_cpu',
                                type: 'number',
                                caption: 'Instance CPU',
                                extras: {
                                    min: 1,
                                    max: 16,
                                    hidePrettyValue: true,
                                    showHint: true,
                                },
                                required: true,
                            },
                            {
                                name: 'instance_total_memory',
                                type: 'number',
                                caption: 'Instance RAM',
                                extras: {
                                    min: ONE_GB,
                                    max: 67 * ONE_GB,
                                    format: 'Bytes',
                                    hidePrettyValue: true,
                                    showHint: true,
                                },
                                required: true,
                            },
                            {
                                name: 'pool',
                                type: 'pool',
                                caption: 'Pool',
                                extras: {
                                    poolTree: defaultPoolTree,
                                    placeholder: 'Pool name...',
                                },
                                required: true,
                            },
                            {
                                name: 'runAfterCreation',
                                type: 'tumbler',
                                caption: 'Run after creation',
                            },
                        ]}
                        initialValues={{
                            instance_count: {value: 1},
                            instance_cpu: {value: 1},
                            instance_total_memory: {value: ONE_GB},
                            pool: currentUser,
                        }}
                    />
                </PoolTreeLoaderWaitDeafultTree>
            )}
        </div>
    );
}
