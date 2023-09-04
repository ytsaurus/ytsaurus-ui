import React, {Fragment, useEffect} from 'react';
import {connect, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import LoadDataHandler from '../../../../components/LoadDataHandler/LoadDataHandler';
import MetaTable from '../../../../components/MetaTable/MetaTable';
import {
    compression,
    erasureReplication,
    main,
    size,
} from '../../../../components/MetaTable/presets';
import {Button, Loader} from '@gravity-ui/uikit';
import Link from '../../../../components/Link/Link';

import {
    getDownloadPath,
    getIsEmpty,
    getIsTooBig,
    getNavigationFileLoadingStatus,
} from '../../../../store/selectors/navigation/content/file';
import {abortAndReset, loadFile} from '../../../../store/actions/navigation/content/file';
import {getAttributes, getPath} from '../../../../store/selectors/navigation';
import {getEffectiveMode} from '../../../../store/selectors/navigation/navigation';

import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../../utils/utils';

import './File.scss';
import NavigationExtraActions from '../../../../containers/NavigationExtraActions/NavigationExtraActions';

const block = cn('navigation-file');
const messageBlock = cn('elements-message');
const codeBlock = cn('elements-code');

const renderMeta = (attributes, mediumList) => {
    return (
        <MetaTable
            items={[
                main(attributes),
                size(attributes, mediumList),
                [...compression(attributes), ...erasureReplication(attributes)],
            ]}
        />
    );
};

const renderActions = (downloadPath) => {
    return (
        <div className={block('actions')}>
            <Button href={downloadPath} target="_blank">
                Download
            </Button>
            <NavigationExtraActions />
        </div>
    );
};

const renderEmptyWarning = () => {
    return (
        <div className={messageBlock({theme: 'warning'})}>
            <p className={messageBlock('paragraph')}>File is empty.</p>
        </div>
    );
};

const renderTooBigInfo = (downloadPath) => {
    return (
        <div className={messageBlock({theme: 'info'})}>
            <p className={messageBlock('paragraph')}>
                The file is too big to be fully shown here. You can{' '}
                <Link url={downloadPath} target="_blank">
                    download
                </Link>{' '}
                it.
            </p>
        </div>
    );
};

const renderContent = (file, isTooBig, downloadPath) => {
    return (
        <Fragment>
            <pre className={codeBlock({theme: 'default'})}>{file}</pre>

            {isTooBig && renderTooBigInfo(downloadPath)}
        </Fragment>
    );
};

function File(props) {
    const {path, mode, loadFile, abortAndReset} = props;
    useEffect(() => {
        loadFile();
        return abortAndReset;
    }, [path, mode]);

    const {loading, loaded, attributes, mediumList, downloadPath, isEmpty, isTooBig, file} = props;
    const initialLoading = loading && !loaded;
    return (
        <LoadDataHandler {...props}>
            <div className={block({loading: initialLoading})}>
                {initialLoading ? (
                    <Loader />
                ) : (
                    <Fragment>
                        {renderMeta(attributes, mediumList)}
                        {renderActions(downloadPath)}
                        {isEmpty
                            ? renderEmptyWarning()
                            : renderContent(file, isTooBig, downloadPath)}
                    </Fragment>
                )}
            </div>
        </LoadDataHandler>
    );
}

File.propTypes = {
    // from connect
    loading: PropTypes.bool.isRequired,
    loaded: PropTypes.bool.isRequired,
    error: PropTypes.bool.isRequired,
    errorData: PropTypes.object.isRequired,

    file: PropTypes.string,
    path: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    isEmpty: PropTypes.bool.isRequired,
    isTooBig: PropTypes.bool.isRequired,
    attributes: PropTypes.object.isRequired,
    downloadPath: PropTypes.string.isRequired,
    mediumList: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,

    loadFile: PropTypes.func.isRequired,
    abortAndReset: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
    const {loading, loaded, error, errorData, file} = state.navigation.content.file;
    const {mediumList} = state.global;

    const downloadPath = getDownloadPath(state);
    const attributes = getAttributes(state);
    const isTooBig = getIsTooBig(state);
    const isEmpty = getIsEmpty(state);
    const path = getPath(state);
    const mode = getEffectiveMode(state);

    return {
        loading,
        loaded,
        error,
        errorData,
        mediumList,
        attributes,
        path,
        mode,
        isEmpty,
        isTooBig,
        downloadPath,
        file,
    };
};
const mapDispatchToProps = {
    loadFile,
    abortAndReset,
};

const FileConnected = connect(mapStateToProps, mapDispatchToProps)(File);

export default function FileWithRum() {
    const loadState = useSelector(getNavigationFileLoadingStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.NAVIGATION_CONTENT_FILE,
        startDeps: [loadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.NAVIGATION_CONTENT_FILE,
        stopDeps: [loadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <FileConnected />;
}
