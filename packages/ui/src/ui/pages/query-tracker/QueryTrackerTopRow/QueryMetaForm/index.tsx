import React, {useCallback} from 'react';
import cn from 'bem-cn-lite';
import {Select, Text} from '@gravity-ui/uikit';
import {EditableAsText} from '../../../../components/EditableAsText/EditableAsText';
import {useDispatch, useSelector} from 'react-redux';
import {Engines} from '../../module/api';
import {SET_QUERY_PATCH} from '../../module/query/actions';
import {getQueryDraft, getQuery} from '../../module/query/selectors';
import {QueryEnginesNames} from '../../utils/query';
import {QuerySettingsButton} from '../../QuerySettingsButton';
import './index.scss';

const EngineOptions = Engines.map((key) => ({
    value: key,
    content: QueryEnginesNames[key],
}));

const block = cn('query-tracker-meta-form');
export function QueryMetaForm({className}: {className: string}) {
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
        <div className={block(null, className)}>
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
                options={EngineOptions}
                value={[draft.engine]}
                onUpdate={onEngineChange}
            />
            <QuerySettingsButton
                className={block('control')}
                settings={draft.settings}
                onChange={onSettingsChange}
            />
        </div>
    );
}
