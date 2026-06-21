import {Button, Flex, Loader} from '@gravity-ui/uikit';
import {MetaTable} from '@ytsaurus/components';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';
import React, {Fragment, useEffect} from 'react';
import {connect} from 'react-redux';
import i18n from './i18n';
import {
    compression,
    erasureReplication,
    main,
    size,
} from '../../../../components/MetaTable/presets';
import Link from '../../../../containers/Link/Link';
import LoadDataHandler from '../../../../containers/LoadDataHandler/LoadDataHandler';
import {useDisableMaxContentWidth} from '../../../../containers/MaxContentWidth';
import NavigationExtraActions from '../../../../containers/NavigationExtraActions/NavigationExtraActions';
import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {abortAndReset, loadFile} from '../../../../store/actions/navigation/content/file';
import {useSelector} from '../../../../store/redux-hooks';
import {selectAttributes, selectPath} from '../../../../store/selectors/navigation';
import {
    selectDownloadPath,
    selectIsEmpty,
    selectIsTooBig,
    selectNavigationFileLoadingStatus,
} from '../../../../store/selectors/navigation/content/file';
import {selectEffectiveMode} from '../../../../store/selectors/navigation/navigation';
import {isFinalLoadingStatus} from '../../../../utils/utils';
import {CurrentPathActions} from '../../components/CurrentPathActions/CurrentPathActions';
import './File.scss';

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
        <Flex className={block('actions')} gap={4}>
            <Button href={downloadPath} target="_blank">
                {i18n('action_download')}
            </Button>
            <NavigationExtraActions />
            <CurrentPathActions />
        </Flex>
    );
};

const renderEmptyWarning = () => {
    return (
        <div className={messageBlock({theme: 'warning'})}>
            <p className={messageBlock('paragraph')}>{i18n('alert_file-empty')}</p>
        </div>
    );
};

const renderTooBigInfo = (downloadPath) => {
    return (
        <div className={messageBlock({theme: 'info'})}>
            <p className={messageBlock('paragraph')}>
                {i18n('alert_file-too-big')}{' '}
                <Link url={downloadPath} target="_blank">
                    {i18n('action_download-link')}
                </Link>{' '}
                {i18n('alert_file-too-big-suffix')}
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

    const downloadPath = selectDownloadPath(state);
    const attributes = selectAttributes(state);
    const isTooBig = selectIsTooBig(state);
    const isEmpty = selectIsEmpty(state);
    const path = selectPath(state);
    const mode = selectEffectiveMode(state);

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
    useDisableMaxContentWidth();

    const loadState = useSelector(selectNavigationFileLoadingStatus);

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
