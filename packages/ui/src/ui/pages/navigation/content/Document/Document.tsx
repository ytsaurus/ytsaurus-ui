import React, {FC, useCallback, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import LoadDataHandler from '../../../../components/LoadDataHandler/LoadDataHandler';
import {Loader} from '@gravity-ui/uikit';
import {
    abortAndReset,
    getDocument,
    saveDocument,
} from '../../../../store/actions/navigation/content/document';
import {getAttributes, getPath} from '../../../../store/selectors/navigation';
import {getEffectiveMode} from '../../../../store/selectors/navigation/navigation';
import {selectNavigationDocument} from '../../../../store/selectors/navigation/content/document';
import './Document.scss';
import DocumentBody from './DocumentBody';
import {SET_DOCUMENT_EDIT_MODE} from '../../../../constants/navigation/content/document';
import DocumentEditModal from './DocumentEditModal';
import unipika from '../../../../common/thor/unipika';

const block = cn('navigation-document');

const Document: FC = () => {
    const dispatch = useDispatch();
    const {loading, loaded, error, errorData, document, editMode} =
        useSelector(selectNavigationDocument);
    const attributes = useSelector(getAttributes);
    const path = useSelector(getPath);
    const settings = unipika.prepareSettings();
    const mode = useSelector(getEffectiveMode);
    const initialLoading = loading && !loaded;

    useEffect(() => {
        dispatch(getDocument());
        return () => {
            dispatch(abortAndReset());
        };
    }, [dispatch, path, mode]);

    const handleEditClick = useCallback(() => {
        dispatch({type: SET_DOCUMENT_EDIT_MODE, data: true});
    }, [dispatch]);

    const handleOnCancel = useCallback(() => {
        dispatch({type: SET_DOCUMENT_EDIT_MODE, data: false});
    }, [dispatch]);

    const handleOnDocumentSave = useCallback(
        async (documentString: string) => {
            await dispatch(saveDocument({path, documentString}));
        },
        [dispatch, path],
    );

    return (
        <LoadDataHandler loaded={loaded} error={error} errorData={errorData}>
            <div className={block({loading: initialLoading})}>
                {initialLoading ? (
                    <Loader />
                ) : (
                    <>
                        <DocumentBody
                            document={document}
                            settings={settings}
                            attributes={attributes}
                            onEditClick={handleEditClick}
                        />
                        <DocumentEditModal
                            settings={settings}
                            open={editMode}
                            onCancel={handleOnCancel}
                            onSave={handleOnDocumentSave}
                            document={document}
                        />
                    </>
                )}
            </div>
        </LoadDataHandler>
    );
};

export default Document;
