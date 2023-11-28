import React, {useCallback} from 'react';
import cn from 'bem-cn-lite';
import {Text} from '@gravity-ui/uikit';
import {EditableAsText} from '../../../../components/EditableAsText/EditableAsText';
import {useDispatch, useSelector} from 'react-redux';
import {getQuery, getQueryDraft} from '../../module/query/selectors';
import {QuerySettingsButton} from '../../QuerySettingsButton';
import {QueryFilesButton} from '../../QueryFilesButton';
import {updateQueryDraft} from '../../module/query/actions';
import {QueryEngineSelector} from './QueryEngineSelector/QueryEngineSelector';

import './QueryMetaForm.scss';
import {QueryFile} from '../../module/api';

const block = cn('query-tracker-meta-form');
export function QueryMetaForm({
    className,
    cluster,
    path,
}: {
    className: string;
    cluster?: string;
    path?: string;
}) {
    const dispatch = useDispatch();
    const draft = useSelector(getQueryDraft);
    const originalQuery = useSelector(getQuery);

    const onNameChange = useCallback(
        (name?: string) => {
            dispatch(updateQueryDraft({annotations: {title: name}}));
        },
        [dispatch],
    );

    const onSettingsChange = useCallback(
        (settings: Record<string, string>) => dispatch(updateQueryDraft({settings})),
        [dispatch],
    );

    const onFilesChange = useCallback(
        (files: QueryFile[]) => dispatch(updateQueryDraft({files})),
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
                size="l"
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
            <QueryEngineSelector cluster={cluster} path={path} className={block('control')} />
            <QuerySettingsButton
                className={block('control')}
                settings={draft.settings}
                onChange={onSettingsChange}
            />
            <QueryFilesButton
                files={draft.files}
                onChange={onFilesChange}
                queryId={originalQuery?.id ?? ''}
            />
        </div>
    );
}
