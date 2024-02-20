import axios, {AxiosProgressEvent} from 'axios';
import cn from 'bem-cn-lite';
import React from 'react';
import {compose} from 'redux';

import Button from '../../../../../components/Button/Button';
import Modal from '../../../../../components/Modal/Modal';
import withVisible, {WithVisibleProps} from '../../../../../hocs/withVisible';

import {Progress} from '@gravity-ui/uikit';
import {ConnectedProps, connect} from 'react-redux';
import {YTDFDialog} from '../../../../../components/Dialog/Dialog';
import {getPath} from '../../../../../store/selectors/navigation';

import hammer from '../../../../../common/hammer';

import UIFactory from '../../../../../UIFactory';
import HelpLink from '../../../../../components/HelpLink/HelpLink';
import Link from '../../../../../components/Link/Link';
import {docsUrl, getConfigUploadTable} from '../../../../../config';
import {updateView} from '../../../../../store/actions/navigation';
import {RootState} from '../../../../../store/reducers';
import {getCluster} from '../../../../../store/selectors/global';
import {getXsrfCookieName} from '../../../../../utils';
import CancelHelper from '../../../../../utils/cancel-helper';
import {wrapApiPromiseByToaster} from '../../../../../utils/utils';
import {DragAndDrop} from './DragAndDrop/DragAndDrop';
import {FORMATS} from './DragAndDrop/constants';
import type {FileFormats, ProgressState} from './DragAndDrop/types';
import './UploadManager.scss';

const block = cn('upload-manager');

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & WithVisibleProps;

interface State {
    name: string;
    progress: ProgressState;
    error: any;

    file: File | null;
    fileType: FileFormats | null;

    firstRowAsNames: boolean;
    secondRowAsTypes: boolean;
}

const UPLOAD_CONFIG = getConfigUploadTable();
const EXCEL_BASE_URL = UPLOAD_CONFIG.uploadTableExcelBaseUrl;

class UploadManagerCreate extends React.Component<Props, State> {
    state: State = {
        name: '',
        progress: {inProgress: false},
        file: null,
        error: null,
        fileType: null,
        firstRowAsNames: true,
        secondRowAsTypes: true,
    };

    private cancelHelper = new CancelHelper();

    renderContent() {
        const {file, progress, error} = this.state;
        return (
            <DragAndDrop
                progress={progress}
                availableFormats={['xls', 'xlsx']}
                renderFileContent={this.renderFileContent}
                file={file}
                onFileChange={this.onFileChange}
                error={error}
                onError={this.onError}
            />
        );
    }

    onError = (error: string | null) => {
        this.setState({error: error !== null ? new Error(error) : null});
    };

    renderFileContent = (file: File) => {
        console.log(this);

        return (
            <React.Fragment>
                {this.renderSettings(file)}
                {this.renderProgress()}
            </React.Fragment>
        );
    };

    renderSettings(file: File) {
        const {path} = this.props;
        const {
            name,
            progress: {inProgress},
        } = this.state;

        return (
            <YTDFDialog
                onAdd={() => Promise.resolve()}
                onClose={() => {}}
                visible={true}
                modal={false}
                initialValues={{
                    path,
                    name: name,
                    size: `${hammer.format['Bytes'](file.size)} / ${hammer.format['Number'](
                        file.size,
                    )} B`,
                    fileType: this.state.fileType,
                    firstRowAsNames: this.state.firstRowAsNames,
                    secondRowAsTypes: this.state.secondRowAsTypes,
                }}
                fields={[
                    {
                        name: 'path',
                        caption: 'Parent folder',
                        type: 'plain',
                    },
                    {
                        name: 'name',
                        caption: 'Name',
                        type: 'text',
                        required: true,
                        extras: {
                            disabled: inProgress,
                        },
                        onChange: (name: string | Array<string> | undefined) => {
                            this.setState({name: name as string});
                            this.onError(null);
                        },
                    },
                    {
                        name: 'size',
                        caption: 'Size',
                        type: 'plain',
                    },
                    {
                        name: 'fileType',
                        type: 'yt-select-single',
                        caption: 'Type',
                        extras: {
                            items: Object.keys(FORMATS).map((format) => ({
                                value: format,
                                text: format,
                            })),
                            hideFilter: true,
                            disabled: true,
                            width: 'max',
                        },
                    },
                    {
                        name: 'firstRowAsNames',
                        type: 'tumbler',
                        caption: 'Column names',
                        tooltip: 'Interpret first row as column names',
                        onChange: (firstRowAsNames: boolean) => {
                            this.setState({firstRowAsNames});
                            this.onError(null);
                        },
                        extras: {
                            disabled: inProgress,
                        },
                    },
                    {
                        name: 'secondRowAsTypes',
                        type: 'tumbler',
                        caption: 'Types',
                        tooltip: 'There is row with types right before data-rows',
                        onChange: (secondRowAsTypes: boolean) => {
                            this.setState({secondRowAsTypes});
                            this.onError(null);
                        },
                        extras: {
                            disabled: inProgress,
                        },
                    },
                ]}
            />
        );
    }

    renderFooterContent() {
        const {file} = this.state;
        const {inProgress} = this.state.progress;
        const helpLink = docsUrl(<HelpLink url={UIFactory.docsUrls['storage:excel']} />);

        if (!file) {
            return helpLink;
        }
        return inProgress ? (
            <React.Fragment>
                <Button onClick={this.cancelUpload}>Cancel upload</Button>
                <span className={block('help-link')}>{helpLink}</span>
            </React.Fragment>
        ) : (
            <React.Fragment>
                <Button onClick={this.onReset}>Reset</Button>
                <span className={block('help-link')}>{helpLink}</span>
            </React.Fragment>
        );
    }

    onFileChange = (file: File | null, name: string, fileType: FileFormats | null) => {
        this.setState({file, name, fileType});
    };

    onReset = () => {
        this.onFileChange(null, '', null);
        this.setState({error: null});
    };

    renderProgress() {
        const {progress} = this.state;
        const event = progress.inProgress ? progress.event : {total: 1, loaded: 0};
        const {total, loaded} = event;
        const totalStr = hammer.format['Bytes'](total);
        const loadedStr = hammer.format['Bytes'](loaded);
        return (
            progress.inProgress && (
                <div
                    className={block('progress', {
                        hidden: !progress.inProgress,
                    })}
                >
                    <div className={block('progress-wrapper')}>
                        <Progress
                            text={`${loadedStr} / ${totalStr}`}
                            stack={[
                                {
                                    value: (100 * loaded) / ((total ?? loaded) || 1),
                                    theme: 'info',
                                },
                            ]}
                        />
                    </div>
                </div>
            )
        );
    }

    cancelUpload = () => {
        this.cancelHelper.removeAllRequests();
    };

    renderConfirm = (className: string) => {
        const {
            progress: {inProgress},
            error,
            file,
        } = this.state;
        return (
            <Button
                className={block('confirm', className)}
                size="m"
                view="action"
                title="Upload"
                disabled={!file || Boolean(error) || inProgress}
                onClick={this.onXlsxUpload}
            >
                Upload
            </Button>
        );
    };

    renderClose = (className: string) => {
        const {
            progress: {inProgress},
        } = this.state;
        return (
            <Button
                className={block('confirm', className)}
                size="m"
                title="Close"
                disabled={inProgress}
                onClick={this.handleClose}
            >
                Close
            </Button>
        );
    };

    onStartUpload(size: number) {
        this.setState({
            progress: {inProgress: true, event: {loaded: 0, total: size}},
            error: null,
        });
    }

    onUploadProgress = (event: AxiosProgressEvent) => {
        this.setState({progress: {inProgress: true, event}});
    };

    onStopUpload(error?: State['error']) {
        this.setState({progress: {inProgress: false}});
        if (!error) {
            this.props.updateView();
            this.props.handleClose();
        } else if (!axios.isCancel(error) && (!error || error.code !== 'cancelled')) {
            error = error.response?.data || error;
            this.setState({error});
        }
    }

    onXlsxUpload = () => {
        const {file, fileType} = this.state;
        if (!file || fileType !== 'xlsx') {
            return;
        }

        const {path: parentDir, cluster} = this.props;
        const {name} = this.state;
        const path = `${parentDir}/${name}`;

        this.onStartUpload(file.size);

        const readyUrl = `${EXCEL_BASE_URL}/${cluster}/api/ready`;
        const uploadUrl = `${EXCEL_BASE_URL}/${cluster}/api/upload`;

        this.cancelHelper.removeAllRequests();
        return axios.get(readyUrl).then(
            () => {
                const {firstRowAsNames, secondRowAsTypes} = this.state;
                const start_row = [firstRowAsNames, secondRowAsTypes].filter(Boolean).length + 1;
                const params = new URLSearchParams({
                    create: String(true),
                    path,
                    header: String(firstRowAsNames),
                    start_row: String(start_row),
                    types: String(secondRowAsTypes),
                });
                const formData = new FormData();
                formData.append('uploadfile', file);
                return wrapApiPromiseByToaster(
                    axios.post(`${uploadUrl}?${params}`, formData, {
                        onUploadProgress: this.onUploadProgress,
                        withCredentials: true,
                        xsrfCookieName: getXsrfCookieName(cluster),
                        xsrfHeaderName: 'X-Csrf-Token',
                        cancelToken: this.cancelHelper.generateNextToken(),
                    }),
                    {
                        toasterName: 'upload_xlsx' + path,
                        successTitle: 'Table is created',
                        errorTitle: 'Failed to create table',
                        successContent: (
                            <Link url={`/${cluster}/navigation?path=${path}`}>{path}</Link>
                        ),
                    },
                ).then(
                    () => {
                        this.onStopUpload();
                    },
                    (e) => {
                        this.onStopUpload(e);
                    },
                );
            },
            (e) => {
                this.onStopUpload({
                    message: `${readyUrl} responded with error`,
                    inner_errors: [e],
                });
            },
        );
    };

    handleClose = () => {
        if (this.state.progress.inProgress) {
            return;
        }
        this.props.handleClose();
    };

    render() {
        const {visible} = this.props;
        return (
            <React.Fragment>
                {visible && (
                    <Modal
                        size="m"
                        title="Upload xlsx"
                        visible={visible}
                        onCancel={this.handleClose}
                        confirmText="Upload"
                        content={this.renderContent()}
                        footerContent={this.renderFooterContent()}
                        renderCustomConfirm={this.renderConfirm}
                        renderCustomCancel={this.renderClose}
                        contentClassName={block()}
                    />
                )}
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state: RootState) => {
    const path: string = getPath(state);

    return {
        path,
        cluster: getCluster(state),
    };
};

const mapDispatchToProps = {
    updateView,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default compose(withVisible, connector)(UploadManagerCreate);
