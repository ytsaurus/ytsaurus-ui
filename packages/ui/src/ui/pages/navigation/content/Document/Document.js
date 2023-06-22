import React, {Fragment, useEffect} from 'react';
import {connect, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import unipika from '../../../../common/thor/unipika';
import cn from 'bem-cn-lite';

import LoadDataHandler from '../../../../components/LoadDataHandler/LoadDataHandler';
import MetaTable from '../../../../components/MetaTable/MetaTable';
import {main} from '../../../../components/MetaTable/presets';
import {Loader} from '@gravity-ui/uikit';
import Yson from '../../../../components/Yson/Yson';

import {abortAndReset, getDocument} from '../../../../store/actions/navigation/content/document';
import {getAttributes, getPath} from '../../../../store/selectors/navigation';
import {getEffectiveMode} from '../../../../store/selectors/navigation/navigation';
import {getNavigationDocumentLoadingStatus} from '../../../../store/selectors/navigation/content/document';
import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {isFinalLoadingStatus} from '../../../../utils/utils';

import './Document.scss';

const block = cn('navigation-document');
const messageBlock = cn('elements-message');

const renderMeta = (attributes) => {
    const [type] = ypath.getValues(attributes, ['/type']);

    return <MetaTable items={[main(attributes), [{key: 'type', value: type}]]} />;
};

const renderDocument = (document, settings, isEmpty) => {
    return isEmpty ? (
        <div className={messageBlock({theme: 'warning'})}>
            <p className={messageBlock('paragraph')}>Document is empty.</p>
        </div>
    ) : (
        <Yson value={document} settings={settings} folding />
    );
};

function Document(props) {
    const {path, mode, getDocument, abortAndReset} = props;
    useEffect(() => {
        getDocument();
        return abortAndReset;
    }, [path, mode]);

    const {loading, loaded, document, settings, isEmpty, attributes} = props;
    const initialLoading = loading && !loaded;

    return (
        <LoadDataHandler {...props}>
            <div className={block({loading: initialLoading})}>
                {initialLoading ? (
                    <Loader />
                ) : (
                    <Fragment>
                        {renderMeta(attributes)}
                        {renderDocument(document, settings, isEmpty)}
                    </Fragment>
                )}
            </div>
        </LoadDataHandler>
    );
}

Document.propTypes = {
    // from connect
    loading: PropTypes.bool.isRequired,
    loaded: PropTypes.bool.isRequired,
    error: PropTypes.bool.isRequired,
    errorData: PropTypes.object.isRequired,

    settings: Yson.settingsProps.isRequired,
    isEmpty: PropTypes.bool.isRequired,
    attributes: PropTypes.object.isRequired,
    path: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    document: PropTypes.object,

    getDocument: PropTypes.func.isRequired,
    abortAndReset: PropTypes.func.isRequired,
};

Document.defaultProps = {
    document: null,
};

const mapStateToProps = (state) => {
    const {loading, loaded, error, errorData, document} = state.navigation.content.document;
    const settings = unipika.prepareSettings();
    const isEmpty = document === null;

    const attributes = getAttributes(state);
    const path = getPath(state);
    const mode = getEffectiveMode(state);

    return {
        loading,
        loaded,
        error,
        errorData,
        attributes,
        path,
        mode,
        document,
        settings,
        isEmpty,
    };
};
const mapDispatchToProps = {
    getDocument,
    abortAndReset,
};

const DocumentConnected = connect(mapStateToProps, mapDispatchToProps)(Document);

export default function DocumentWithRum() {
    const loadState = useSelector(getNavigationDocumentLoadingStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.NAVIGATION_CONTENT_DOCUMENT,
        startDeps: [loadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.NAVIGATION_CONTENT_DOCUMENT,
        stopDeps: [loadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <DocumentConnected />;
}
