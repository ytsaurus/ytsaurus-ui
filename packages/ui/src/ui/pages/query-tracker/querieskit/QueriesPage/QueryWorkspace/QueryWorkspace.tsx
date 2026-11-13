import React, {useEffect} from 'react';
import {
    type QueryWorkspaceExecutionContext,
    QueryWorkspaceLayout,
} from '@gravity-ui/querieskit/modules/QueryWorkspaceLayout';
import {QueryEditor} from '@gravity-ui/querieskit/widgets/QueryEditor';
import {QueryExecutionPanel} from '@gravity-ui/querieskit/widgets/QueryExecutionPanel';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {setFileEditor} from '../../../../../store/reducers/query-tracker/queryFilesFormSlice';
import {selectFileEditorConfig} from '../../../../../store/selectors/query-tracker/queryFilesForm';
import {selectCurrentQuery} from '../../../../../store/selectors/query-tracker/query';
import {useQueryExecution} from '../../QueryExecutionView/useQueryExecution';
import {getQueryStatus} from '../../queriesKitStatus';
import {QueryFileWorkspace} from '../QueryFileWorkspace/QueryFileWorkspace';
import {useQueryEditorProps} from '../useQueryEditorProps';

type Props = {
    onStartQuery: (id: string) => boolean | void;
};

function ConnectedQueryEditor({active, onStartQuery}: Props & {active: boolean}) {
    const {editorProps, modal} = useQueryEditorProps({active, onStartQuery});
    return (
        <>
            <QueryEditor {...editorProps} />
            {modal}
        </>
    );
}

function ConnectedQueryExecution(layout: QueryWorkspaceExecutionContext) {
    const query = useSelector(selectCurrentQuery);
    const {props, modal} = useQueryExecution({query, ...layout});
    return (
        <>
            <QueryExecutionPanel {...props} {...layout} />
            {modal}
        </>
    );
}

export function QueryWorkspace({onStartQuery}: Props) {
    const dispatch = useDispatch();
    const query = useSelector(selectCurrentQuery);
    const {fileEditor: file, file: editedFile} = useSelector(selectFileEditorConfig);
    useEffect(() => {
        if (file.isOpen && !editedFile) {
            dispatch(setFileEditor({...file, isOpen: false, isFullWidth: false}));
        }
    }, [dispatch, file, editedFile]);
    useEffect(() => {
        dispatch(
            setFileEditor({isOpen: false, isFullWidth: false, fileId: null, fileType: 'file'}),
        );
    }, [dispatch, query?.id]);

    // Execution tabs and status content are supplied only for a saved query.
    const showResults = Boolean(query?.id) || getQueryStatus(query?.state) !== 'draft';
    return (
        <QueryFileWorkspace>
            <QueryWorkspaceLayout
                active={!(file.isOpen && file.isFullWidth)}
                showResults={showResults}
                defaultCollapsed={!query?.id}
                renderEditor={({active: editorActive}) => (
                    <ConnectedQueryEditor active={editorActive} onStartQuery={onStartQuery} />
                )}
                renderExecutionPanel={(layout) => <ConnectedQueryExecution {...layout} />}
            />
        </QueryFileWorkspace>
    );
}
