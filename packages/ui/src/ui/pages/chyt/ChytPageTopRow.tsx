import React, {Key} from 'react';
import {useDispatch, useSelector} from '../../store/redux-hooks';
import {useHistory} from 'react-router';
import cn from 'bem-cn-lite';

import ypath from '../../common/thor/ypath';

import {Breadcrumbs, Button, Flex, Text} from '@gravity-ui/uikit';

import ClipboardButton from '../../components/ClipboardButton/ClipboardButton';
import {YTDFDialog, makeErrorFields} from '../../components/Dialog';
import Favourites, {FavouritesItem} from '../../components/Favourites/Favourites';
import {EditableBreadcrumbs} from '../../components/EditableBreadcrumbs';
import Suggest from '../../components/Suggest/Suggest';
import {Page} from '../../constants';
import {RowWithName} from '../../containers/AppNavigation/TopRowContent/SectionName';
import {WaitForDefaultPoolTree} from '../../hooks/global-pool-trees';
import {getFavouriteChyt, isActiveCliqueInFavourites} from '../../store/selectors/favourites';
import {getChytCurrentAlias} from '../../store/selectors/chyt';
import {getCluster} from '../../store/selectors/global';
import {isDeveloper} from '../../store/selectors/global/is-developer';
import {chytApiAction} from '../../utils/strawberryControllerApi';
import {chytCliqueCreate} from '../../store/actions/chyt/list';
import {chytToggleFavourite} from '../../store/actions/favourites';
import {YTError} from '../../../@types/types';
import {ChytCliquePageTab} from '../../constants/chyt-page';

import './ChytPageTopRow.scss';

const block = cn('chyt-page-top-row');

export default function ChytPageTopRow() {
    return (
        <RowWithName page={Page.CHYT} name="CHYT cliques">
            <ChytFavourites />
            <Flex justifyContent={'space-between'} alignItems={'center'} grow={1}>
                <ChytBreadcrumbs />
                <CreateChytButton />
            </Flex>
        </RowWithName>
    );
}

function ChytFavourites() {
    const history = useHistory();
    const cluster = useSelector(getCluster);
    const isActiveInFavourites = useSelector(isActiveCliqueInFavourites);
    const favourites = useSelector(getFavouriteChyt);
    const dispatch = useDispatch();
    const currentClique = useSelector(getChytCurrentAlias);

    const handleFavouriteItemClick = React.useCallback(
        (item: FavouritesItem) => {
            history.push(`/${cluster}/${Page.CHYT}/${item.path}`);
        },
        [history, cluster],
    );

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

function ChytBreadcrumbs() {
    const history = useHistory();
    const cluster = useSelector(getCluster);
    const alias = useSelector(getChytCurrentAlias);

    const handleBreadcrumbClick = React.useCallback(
        (key: Key) => {
            history.push(`/${cluster}/${Page.CHYT}/${key}`);
        },
        [history, cluster],
    );

    const items = React.useMemo(() => {
        const result = [
            <Breadcrumbs.Item
                key="/"
                href={`/${cluster}/${Page.CHYT}`}
                onClick={(e) => e.preventDefault()}
            >
                {'<Root>'}
            </Breadcrumbs.Item>,
        ];

        if (alias) {
            result.push(
                <Breadcrumbs.Item
                    key={alias}
                    href={`/${cluster}/${Page.CHYT}/${alias}`}
                    onClick={(e) => e.preventDefault()}
                >
                    {alias}
                </Breadcrumbs.Item>,
            );
        }

        return result;
    }, [alias, cluster]);

    return (
        <EditableBreadcrumbs
            className={block('breadcrumbs')}
            onChange={(text) => {
                if (!text) {
                    history.push(`/${cluster}/${Page.CHYT}`);
                } else if (text !== alias) {
                    history.push(`/${cluster}/${Page.CHYT}/${text}`);
                }
            }}
            onAction={handleBreadcrumbClick}
            text={alias}
            disableEdit={Boolean(!alias)}
            renderEditor={(props) => <ChytAliasSuggest cluster={cluster} {...props} />}
            endContent={<>{alias && <ClipboardButton text={alias} />}</>}
        >
            {items}
        </EditableBreadcrumbs>
    );
}

function ChytAliasSuggest({
    value,
    onChange,
    className,
    onApply,
    cluster,
    onBlur,
}: {
    cluster: string;
    value?: string;
    onChange: (value?: string) => void;
    className?: string;
    onBlur: () => void;
    onApply: (value?: string) => void;
}) {
    const [items, setItems] = React.useState<Array<string>>([]);

    const isAdmin = useSelector(isDeveloper);

    React.useEffect(() => {
        chytApiAction('list', cluster, {}, {isAdmin}).then((data) => {
            setItems(data.result.map((item) => ypath.getValue(item)));
        });
    }, [isAdmin]);

    return (
        <Suggest
            autoFocus
            className={`${block('alias-suggest')} ${className}`}
            text={value}
            filter={(_x, text) => {
                if (!text) {
                    return items;
                }
                return items.filter((item) => {
                    return -1 !== item.indexOf(text);
                });
            }}
            apply={(item) => {
                if ('string' === typeof item) {
                    onChange(item);
                } else {
                    onChange(item.value);
                }
            }}
            onItemClick={(item) => {
                onApply(typeof item === 'string' ? item : item.value);
            }}
            onBlur={onBlur}
        />
    );
}

type FormValues = {
    alias: string;
    instance_count: number;
    tree: string[];
    pool: string;
    runAfterCreation: boolean;
};

function CreateChytButton() {
    const dispatch = useDispatch();
    const history = useHistory();
    const cluster = useSelector(getCluster);
    const [visible, setVisible] = React.useState(false);

    const [error, setError] = React.useState<YTError | undefined>();

    return (
        <div className={block('create-clique')}>
            <Button view="action" onClick={() => setVisible(!visible)}>
                Create clique
            </Button>
            {visible && (
                <WaitForDefaultPoolTree>
                    {({defaultPoolTree}) => (
                        <YTDFDialog<FormValues>
                            visible
                            className={block('create-dialog')}
                            headerProps={{title: 'Create clique'}}
                            onClose={() => setVisible(false)}
                            onAdd={(form) => {
                                const {
                                    values: {instance_count, ...rest},
                                } = form.getState();
                                return dispatch(
                                    chytCliqueCreate({
                                        ...rest,
                                        instance_count: instance_count || 1,
                                    }),
                                )
                                    .then(() => {
                                        setError(undefined);
                                        history.push(
                                            `/${cluster}/chyt/${rest.alias}/${ChytCliquePageTab.SPECLET}`,
                                        );
                                    })
                                    .catch((e) => {
                                        setError(e);
                                        return Promise.reject(e);
                                    });
                            }}
                            fields={[
                                {
                                    name: 'alias',
                                    type: 'text',
                                    caption: 'Alias name',
                                    required: true,
                                },
                                {
                                    name: 'instance_count',
                                    type: 'range-input-picker',
                                    caption: 'Instance count',
                                    extras: {
                                        minValue: 1,
                                        maxValue: 100,
                                    },
                                    required: true,
                                },
                                {
                                    name: 'tree',
                                    type: 'pool-tree',
                                    caption: 'Pool tree',
                                    extras: {
                                        multiple: true,
                                    },
                                },
                                {
                                    name: 'pool',
                                    type: 'pool',
                                    caption: 'Pool',
                                    extras: ({tree}: FormValues) => {
                                        return {
                                            poolTrees: tree,
                                            placeholder: 'Pool name...',
                                            allowEmpty: true,
                                        };
                                    },
                                },
                                {
                                    name: 'poolNotice',
                                    type: 'block',
                                    visibilityCondition: {
                                        when: 'pool',
                                        isActive(pool) {
                                            return !pool;
                                        },
                                    },
                                    extras: {
                                        children: (
                                            <Text color="info-heavy" variant="body-2">
                                                Select a pool to start the clique after creation.
                                            </Text>
                                        ),
                                    },
                                },
                                {
                                    name: 'runAfterCreation',
                                    type: 'tumbler',
                                    caption: 'Start after creation',
                                    visibilityCondition: {
                                        when: 'pool',
                                        isActive(v) {
                                            return Boolean(v);
                                        },
                                    },
                                },
                                ...makeErrorFields([error]),
                            ]}
                            initialValues={{
                                instance_count: 1,
                                tree: [defaultPoolTree],
                                runAfterCreation: true,
                            }}
                        />
                    )}
                </WaitForDefaultPoolTree>
            )}
        </div>
    );
}
