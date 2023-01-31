import React, {useCallback, useMemo} from 'react';
import cn from 'bem-cn-lite';
import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';
import {Button, Icon, Select, SelectOption, Text, SelectProps} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import {createEmptyQuery, SET_QUERY_PATCH} from '../module/query/actions';
import {getQuery, getQueryDraft} from '../module/query/selectors';
import {EngineKeys, QueryEngine} from '../module/api';
import {QueryEnginesNames} from '../utils/query';
import chevronDownIcon from '../../../../../img/svg/icons/chevron-down.svg';
import {EditableAsText} from '../../../components/EditableAsText/EditableAsText';
import {QuerySettingsButton} from '../QuerySettingsButton';
import {getCluster} from '../../../store/selectors/global';
import {createNewQueryUrl} from '../utils/navigation';
import Link from '../../../components/Link/Link';
import {Page} from '../../../../shared/constants/settings';
import './index.scss';

const block = cn('query-tracker-top-row-content');

const engineBlock = cn('query-tracker-top-row-content');

const Engines = EngineKeys.map((key) => ({
    value: key,
    content: QueryEnginesNames[key],
}));

const engineSelectorItem = cn('query-language-selector-item');

const NewQuerySelector = ({
    defaultEngine,
}: {
    defaultEngine: QueryEngine;
    onChoose?: (engine: QueryEngine) => void;
}) => {
    const cluster = useSelector(getCluster);

    const engines = useMemo<SelectOption[]>(() => {
        return EngineKeys.map((engine) => ({
            value: engine,
            content: (
                <Link
                    className={engineSelectorItem('link')}
                    routed
                    url={createNewQueryUrl(cluster, engine)}
                >
                    {QueryEnginesNames[engine]}
                </Link>
            ),
        }));
    }, [cluster]);

    const renderSelectControl = useCallback<Required<SelectProps>['renderControl']>(
        ({onClick, onKeyDown, ref}) => {
            return (
                <Button pin="brick-round" ref={ref} onClick={onClick} extraProps={{onKeyDown}}>
                    <Icon data={chevronDownIcon} />
                </Button>
            );
        },
        [],
    );

    return (
        <div className={engineBlock()}>
            <Link routed url={createNewQueryUrl(cluster, defaultEngine)}>
                <Button className={engineBlock('default')} pin="round-brick">
                    New query in {QueryEnginesNames[defaultEngine]} syntax
                </Button>
            </Link>
            <Select
                popupClassName={engineBlock('select')}
                options={engines}
                renderControl={renderSelectControl}
            />
        </div>
    );
};

function QueryTopRow() {
    const dispatch = useDispatch();
    const draft = useSelector(getQueryDraft);
    const originalQuery = useSelector(getQuery);

    const onEngineChange = useCallback(
        (engines: string[]) => {
            dispatch({
                type: SET_QUERY_PATCH,
                data: {
                    engine: engines[0],
                },
            });
        },
        [dispatch],
    );
    const createQuery = useCallback(
        (engine: QueryEngine) => {
            dispatch(createEmptyQuery(engine));
        },
        [dispatch],
    );

    const onNameChange = useCallback(
        (name: string) => {
            dispatch({
                type: SET_QUERY_PATCH,
                data: {
                    annotations: {
                        title: name,
                    },
                },
            });
        },
        [dispatch],
    );

    const onSettingsChange = useCallback(
        (settings: Record<string, string>) => {
            dispatch({
                type: SET_QUERY_PATCH,
                data: {
                    settings,
                },
            });
        },
        [dispatch],
    );

    const queryName = draft.annotations?.title;

    return (
        <>
            <div className={block('meta')}>
                <EditableAsText
                    withControls
                    className={block('control', {name: true})}
                    onChange={onNameChange}
                    text={queryName}
                    key={originalQuery?.id}
                >
                    <Text
                        title={queryName}
                        variant="body-1"
                        color={queryName ? 'primary' : 'secondary'}
                        ellipsis
                    >
                        {queryName || 'No name'}
                    </Text>
                </EditableAsText>
                <Select
                    className={block('control')}
                    options={Engines}
                    value={[draft.engine]}
                    onUpdate={onEngineChange}
                />
                <QuerySettingsButton
                    className={block('control')}
                    settings={draft.settings}
                    onChange={onSettingsChange}
                />
            </div>
            <div>
                <NewQuerySelector defaultEngine={QueryEngine.YQL} onChoose={createQuery} />
            </div>
        </>
    );
}

export function QueryTrackerTopRow() {
    return (
        <RowWithName page={Page.QUERIES} className={block()}>
            <QueryTopRow />
        </RowWithName>
    );
}
