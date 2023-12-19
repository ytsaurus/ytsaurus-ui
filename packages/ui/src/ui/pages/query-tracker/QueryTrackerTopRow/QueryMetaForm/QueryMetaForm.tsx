import React, {useCallback} from 'react';
import cn from 'bem-cn-lite';
import {Text} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import {EditableAsText} from '../../../../components/EditableAsText/EditableAsText';
import {Toolbar} from '../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {getQuery, getQueryDraft} from '../../module/query/selectors';
import {QuerySettingsButton} from '../../QuerySettingsButton';
import {QueryFilesButton} from '../../QueryFilesButton';
import {updateQueryDraft} from '../../module/query/actions';
import {QueryFile} from '../../module/api';
import {NewQueryButton} from '../../NewQueryButton/NewQueryButton';
import {QueryEngineSelector} from './QueryEngineSelector/QueryEngineSelector';

import './QueryMetaForm.scss';

const block = cn('query-tracker-meta-form');
export function QueryMetaForm({
    onClickOnNewQueryButton,
    className,
    cluster,
    path,
}: {
    className: string;
    cluster?: string;
    path?: string;
    onClickOnNewQueryButton: () => void;
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
            <Toolbar
                itemsToWrap={[
                    {
                        name: 'query-name',
                        marginRight: 'half',
                        node: (
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
                        ),
                    },
                    {
                        name: 'Engine',
                        marginRight: 'half',
                        node: <QueryEngineSelector cluster={cluster} path={path} />,
                    },
                    {
                        name: 'Settings',
                        marginRight: 'half',
                        node: (
                            <QuerySettingsButton
                                settings={draft.settings}
                                onChange={onSettingsChange}
                            />
                        ),
                    },
                    {
                        name: 'Files',
                        marginRight: 'half',
                        node: (
                            <QueryFilesButton
                                files={draft.files}
                                onChange={onFilesChange}
                                queryId={originalQuery?.id ?? ''}
                            />
                        ),
                    },
                    {
                        name: 'NewQuery',
                        marginRight: 'half',
                        node: <NewQueryButton onClick={onClickOnNewQueryButton} />,
                    },
                ]}
            />
        </div>
    );
}
