import React from 'react';
import {compose} from 'redux';
import axios, {AxiosProgressEvent} from 'axios';
import cn from 'bem-cn-lite';

import withVisible, {WithVisibleProps} from '../../../../../hocs/withVisible';
import Button from '../../../../../components/Button/Button';
import Modal from '../../../../../components/Modal/Modal';

import {getPath} from '../../../../../store/selectors/navigation';
import {ConnectedProps, connect} from 'react-redux';
import Error from '../../../../../components/Block/Block';
import {YTDFDialog} from '../../../../../components/Dialog/Dialog';
import {Progress} from '@gravity-ui/uikit';

import hammer from '../../../../../common/hammer';
import format from '../../../../../common/hammer/format';

import './UploadManager.scss';
import {updateView} from '../../../../../store/actions/navigation';
import FilePicker from '../../../../../components/FilePicker/FilePicker';
import {getCluster} from '../../../../../store/selectors/global';
import {RootState} from '../../../../../store/reducers';
import {getXsrfCookieName} from '../../../../../utils';
import {wrapApiPromiseByToaster} from '../../../../../utils/utils';
import Link from '../../../../../components/Link/Link';
import {docsUrl, getConfigUploadTable} from '../../../../../config';
import HelpLink from '../../../../../components/HelpLink/HelpLink';
import CancelHelper from '../../../../../utils/cancel-helper';
import UIFactory from '../../../../../UIFactory';

const block = cn('upload-manager');

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & WithVisibleProps;

function trimXLSX(fileName = '') {
    for (const i of ['.xlsx', '.xls']) {
        if (fileName.toLowerCase().endsWith(i)) {
            return fileName.substr(0, fileName.length - i.length);
        }
    }
    return fileName;
}

interface State {
    name: string;

    hasUpcomingFile: boolean;
    progress: ProgressState;
    error?: any;

    file: File | null;
    fileType: FileType;

    firstRowAsNames: boolean;
    secondRowAsTypes: boolean;
}

type FileType = 'xlsx';

const FILE_TYPES: Array<{value: FileType; title: FileType}> = [{value: 'xlsx', title: 'xlsx'}];

type ProgressState =
    | {inProgress: false}
    | {inProgress: true; event: {total?: number; loaded: number}};

const UPLOAD_CONFIG = getConfigUploadTable();
const EXCEL_BASE_URL = UPLOAD_CONFIG.uploadTableExcelBaseUrl;

class UploadManagerCreate extends React.Component<Props, State> {
    state: State = {
        name: '',
        hasUpcomingFile: false,
        file: null,
        fileType: 'xlsx',
        progress: {inProgress: false},
        firstRowAsNames: true,
        secondRowAsTypes: true,
    };

    private cancelHelper = new CancelHelper();

    renderContent() {
        const {hasUpcomingFile, file, error} = this.state;
        return (
            <React.Fragment>
                <div
                    className={block('drag-area', {
                        dropable: hasUpcomingFile,
                        empty: !file,
                    })}
                    onDrop={this.onDrop}
                    onDragEnter={this.onDragEnter}
                    onDragLeave={this.onDragLeave}
                    onDragOver={this.onDragOver}
                >
                    {file ? (
                        this.renderFileContent(file)
                    ) : (
                        <div>
                            <div>Drag a file here</div>
                            or
                            <div>
                                <FilePicker onChange={this.onFile}>Pick a file</FilePicker>
                            </div>
                        </div>
                    )}
                </div>
                {error && <Error error={error} message={'The file upload has failed'} />}
            </React.Fragment>
        );
    }

    renderFileContent(file: File) {
        return (
            <React.Fragment>
                {this.renderSettings(file)}
                {this.renderProgress()}
            </React.Fragment>
        );
    }

    renderSettings(file: File) {
        const {path} = this.props;
        const {name} = this.state;
        const inProgress = this.inProgress();
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
                            items: FILE_TYPES,
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
        const inProgress = this.inProgress();
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

    onReset = () => {
        this.onFile(null);
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

    inProgress() {
        const {progress} = this.state;
        return progress.inProgress;
    }

    onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (this.inProgress()) {
            return;
        }

        if (!this.state.hasUpcomingFile) {
            this.setState({hasUpcomingFile: true});
        }
    };

    onDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (this.inProgress()) {
            return;
        }

        const {files} = event.dataTransfer;
        if (!files) {
            return;
        }

        this.onFile(files);
    };

    onFile = (files: FileList | null) => {
        const file = files && files[0];
        this.setState({
            file,
            hasUpcomingFile: false,
            name: trimXLSX(file?.name) || '',
        });
        if (file) {
            const fileError = this.checkFile(file);
            if (fileError) {
                this.setState({error: {message: fileError}});
            }
        }
    };

    onDragEnter = () => {
        if (!this.inProgress()) {
            this.setState({hasUpcomingFile: true});
        }
    };

    onDragLeave = () => {
        if (!this.inProgress()) {
            this.setState({hasUpcomingFile: false});
        }
    };

    renderConfirm = () => {
        const fileError = this.checkFile(this.state.file);
        return (
            <Button
                className={block('confirm')}
                size="m"
                view="action"
                title="Upload"
                disabled={Boolean(fileError) || this.inProgress()}
                onClick={this.onXlsxUpload}
            >
                Upload
            </Button>
        );
    };

    checkFile(file: State['file']): string | null {
        if (!file) {
            return 'file is not selected';
        }

        if (file.size > UPLOAD_CONFIG.uploadTableMaxSize) {
            return `File size must not be greater than ${format.Bytes(
                UPLOAD_CONFIG.uploadTableMaxSize,
            )}`;
        }

        return null;
    }

    renderClose = (className: string) => {
        return (
            <Button
                className={block('confirm', className)}
                size="m"
                title="Close"
                disabled={this.inProgress()}
                onClick={this.handleClose}
            >
                Close
            </Button>
        );
    };

    onStartUpload(size: number) {
        this.setState({
            progress: {inProgress: true, event: {loaded: 0, total: size}},
            error: undefined,
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
        if (this.inProgress()) {
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
