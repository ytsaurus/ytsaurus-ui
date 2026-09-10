import {Button, Flex, Loader} from '@gravity-ui/uikit';
import {MetaTable} from '@ytsaurus/components';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';
import React, {Fragment, useEffect} from 'react';
import i18n from './i18n';
import {
    compression,
    erasureReplication,
    main,
    size,
} from '../../../../components/MetaTable/presets';
import Link from '../../../../containers/Link/Link';
import LoadDataHandler from '../../../../containers/LoadDataHandler/LoadDataHandler';
import NavigationExtraActions from '../../../../containers/NavigationExtraActions/NavigationExtraActions';
import {CurrentPathActions} from '../../components/CurrentPathActions/CurrentPathActions';

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

export function FileBase(props) {
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

FileBase.propTypes = {
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
