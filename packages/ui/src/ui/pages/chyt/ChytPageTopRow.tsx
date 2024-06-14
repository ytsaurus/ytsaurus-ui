import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router';
import cn from 'bem-cn-lite';

import ypath from '../../common/thor/ypath';

import {Breadcrumbs, BreadcrumbsItem, Button, Text} from '@gravity-ui/uikit';

import ClipboardButton from '../../components/ClipboardButton/ClipboardButton';
import {YTDFDialog, makeErrorFields} from '../../components/Dialog/Dialog';
import Favourites, {FavouritesItem} from '../../components/Favourites/Favourites';
import {EditableAsText} from '../../components/EditableAsText/EditableAsText';
import Link from '../../components/Link/Link';
import Suggest from '../../components/Suggest/Suggest';
import {Page} from '../../constants';
import {RowWithName} from '../../containers/AppNavigation/TopRowContent/SectionName';
import {WaitForDefaultPoolTree} from '../../hooks/global-pool-trees';
import {getFavouriteChyt, isActiveCliqueInFavourites} from '../../store/selectors/favourites';
import {getChytCurrentAlias} from '../../store/selectors/chyt';
import {getCluster, isDeveloper} from '../../store/selectors/global';
import {chytApiAction} from '../../utils/api';
import {chytCliqueCreate} from '../../store/actions/chyt/list';
import {chytToggleFavourite} from '../../store/actions/favourites';
import {useThunkDispatch} from '../../store/thunkDispatch';
import {YTError} from '../../../@types/types';
import {ChytCliquePageTab} from '../../constants/chyt-page';

import './ChytPageTopRow.scss';

const block = cn('chyt-page-top-row');

export default function ChytPageTopRow() {
    return (
        <RowWithName page={Page.CHYT} name="CHYT cliques">
            <ChytFavourites />
            <ChytBreadcrumsbs />
            <CreateChytButton />
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

function ChytBreadcrumsbs() {
    const history = useHistory();
    const cluster = useSelector(getCluster);
    const alias = useSelector(getChytCurrentAlias);
    const items = React.useMemo(() => {
        const res: Array<BreadcrumbsItem & {url: string}> = [
            {
                text: '<Root>',
                url: `/${cluster}/${Page.CHYT}`,
                action: () => {},
            },
        ];
        if (alias) {
            res.push({text: alias, url: `/${cluster}/${Page.CHYT}/${alias}`, action: () => {}});
        }
        return res;
    }, [alias]);

    return (
        <div className={block('breadcrumbs')}>
            <EditableAsText
                className={block('editable')}
                onChange={(text) => {
                    if (!text) {
                        history.push(`/${cluster}/${Page.CHYT}`);
                    } else if (text !== alias) {
                        history.push(`/${cluster}/${Page.CHYT}/${text}`);
                    }
                }}
                text={alias}
                disableEdit={Boolean(!alias)}
                renderEditor={(props) => <ChytAliasSuggest cluster={cluster} {...props} />}
            >
                <Breadcrumbs
                    items={items}
                    lastDisplayedItemsCount={2}
                    firstDisplayedItemsCount={1}
                    renderItemContent={(item, isCurrent) => {
                        return (
                            <Link url={item.url} theme={isCurrent ? 'primary' : 'secondary'} routed>
                                {item.text}
                            </Link>
                        );
                    }}
                />
            </EditableAsText>
            {alias && <ClipboardButton text={alias} />}
        </div>
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
    tree: string;
    pool: string;
    runAfterCreation: boolean;
};

function CreateChytButton() {
    const dispatch = useThunkDispatch();
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
                                        disabled: true,
                                    },
                                },
                                {
                                    name: 'pool',
                                    type: 'pool',
                                    caption: 'Pool',
                                    extras: ({tree}: FormValues) => {
                                        return {
                                            poolTree: tree,
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
                                tree: defaultPoolTree,
                                runAfterCreation: true,
                            }}
                        />
                    )}
                </WaitForDefaultPoolTree>
            )}
        </div>
    );
}
