import React from 'react';
import _ from 'lodash';
import {compose} from 'redux';
import axios from 'axios';
import cn from 'bem-cn-lite';

// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import format from '../../../../../common/hammer/format';

import withVisible, {WithVisibleProps} from '../../../../../hocs/withVisible';
import Button from '../../../../../components/Button/Button';
import Icon from '../../../../../components/Icon/Icon';
import Modal from '../../../../../components/Modal/Modal';

import {getPath} from '../../../../../store/selectors/navigation';
import {connect, ConnectedProps} from 'react-redux';
import Error from '../../../../../components/Block/Block';
import Dialog, {DialogField} from '../../../../../components/Dialog/Dialog';
import {Progress} from '@gravity-ui/uikit';

import hammer from '../../../../../common/hammer';

import './UploadManager.scss';
import {updateView} from '../../../../../store/actions/navigation';
import FilePicker from '../../../../../components/FilePicker/FilePicker';
import {getSchema} from '../../../../../store/selectors/navigation/tabs/schema';
import {getCluster, getCurrentClusterConfig} from '../../../../../store/selectors/global';
import {RootState} from '../../../../../store/reducers';
import {getXsrfCookieName} from '../../../../../utils';
import {docsUrl, getConfigUploadTable} from '../../../../../config';
import HelpLink from '../../../../../components/HelpLink/HelpLink';
import CancelHelper from '../../../../../utils/cancel-helper';
import UIFactory from '../../../../../UIFactory';

const block = cn('upload-manager');

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & WithVisibleProps;

interface State {
    hasUpcomingFile: boolean;
    progress: ProgressState;
    error?: any;

    file: File | null;
    fileType: FileType;
    append: boolean;

    // xlsx
    firstRowAsNames: boolean;
    secondRowAsTypes: boolean;

    showOverwriteConfirmation: boolean;
}

const WRITE_ATTRIBUTES = {
    json: {
        format: 'text',
        enable_type_conversion: true,
    },
    yson: {
        enable_type_conversion: true,
    },
    yamr: {},
    dsv: {
        enable_string_to_all_conversion: true,
    },
    schemaful_dsv: {
        enable_string_to_all_conversion: true,
    },
    xlsx: {},
};

type FileType = 'json' | 'yson' | 'yamr' | 'dsv' | 'schemaful_dsv' | 'xlsx';

const FILE_TYPES: Array<{value: FileType; text: FileType}> = [
    {value: 'json', text: 'json'},
    {value: 'yson', text: 'yson'},
    {value: 'dsv', text: 'dsv'},
    {value: 'yamr', text: 'yamr'},
    {value: 'schemaful_dsv', text: 'schemaful_dsv'},
];

const UPLOAD_CONFIG = getConfigUploadTable();

const EXCEL_BASE_URL = UPLOAD_CONFIG.uploadTableExcelBaseUrl;
if (EXCEL_BASE_URL) {
    FILE_TYPES.push({value: 'xlsx', text: 'xlsx'});
}

type ProgressState =
    | {inProgress: false}
    | {inProgress: true; event: {total: number; loaded: number}};

class UploadManager extends React.Component<Props, State> {
    state: State = {
        hasUpcomingFile: false,
        file: null,
        fileType: 'json',
        progress: {inProgress: false},
        append: true,
        firstRowAsNames: false,
        secondRowAsTypes: false,

        showOverwriteConfirmation: false,
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
        const inProgress = this.inProgress();

        const {fields, initials} = this.typeSpecificFields();
        return (
            <Dialog
                onAdd={() => Promise.resolve()}
                onClose={() => {}}
                visible={true}
                modal={false}
                initialValues={{
                    name: file.name,
                    size: `${hammer.format['Bytes'](file.size)} / ${hammer.format['Number'](
                        file.size,
                    )} B`,
                    append: this.state.append,
                    fileType: this.state.fileType,
                    ...initials,
                }}
                fields={[
                    {
                        name: 'name',
                        caption: 'Name',
                        type: 'plain',
                    },
                    {
                        name: 'size',
                        caption: 'Size',
                        type: 'plain',
                    },
                    {
                        name: 'append',
                        caption: 'Append',
                        type: 'tumbler',
                        tooltip: 'Append content of the file to the end of the destination',
                        extras: {
                            disabled: inProgress,
                        },
                        onChange: (append: boolean) => {
                            this.setState({append});
                        },
                    },
                    {
                        name: 'fileType',
                        type: 'yt-select-single',
                        caption: 'Type',
                        extras: {
                            items: FILE_TYPES,
                            hideFilter: true,
                            disabled: inProgress,
                            width: 'max',
                        },
                        onChange: (fileType: string | Array<string> | undefined) => {
                            this.setState({
                                fileType: (fileType as FileType) || 'json',
                            });
                        },
                    },
                    ...fields,
                ]}
            />
        );
    }

    typeSpecificFields() {
        const {fileType} = this.state;
        const fields: Array<DialogField> = [];
        const initials: Partial<{firstRowAsNames: boolean}> = {};
        switch (fileType) {
            case 'xlsx': {
                fields.push(
                    {
                        name: 'firstRowAsNames',
                        type: 'tumbler',
                        caption: 'Column names',
                        tooltip: 'Interpret first row as column names',
                        onChange: (firstRowAsNames: boolean) => {
                            this.setState({firstRowAsNames});
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
                    },
                );
                Object.assign(initials, {
                    firstRowAsNames: this.state.firstRowAsNames,
                    secondRowAsTypes: this.state.secondRowAsTypes,
                });
                break;
            }
        }
        return {fields, initials};
    }

    renderFooterContent() {
        const {file, fileType} = this.state;
        const inProgress = this.inProgress();
        const url =
            fileType === 'xlsx'
                ? UIFactory.docsUrls['storage:excel']
                : UIFactory.docsUrls['storage:formats'];
        const helpLink = docsUrl(<HelpLink url={url} />);
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
                                    value: (100 * loaded) / total,
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
        this.setState({file, hasUpcomingFile: false});
        if (file) {
            const lastDotIndex = file.name.lastIndexOf('.');
            const extStr = file.name.substr(lastDotIndex + 1);
            const item = FILE_TYPES.find(({value}) => value === extStr);
            if (item) {
                this.setState({fileType: item.value});
            }

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
                onClick={this.onConfirm}
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
                className={block('close', className)}
                size="m"
                title="Close"
                disabled={this.inProgress()}
                onClick={this.handleClose}
            >
                Close
            </Button>
        );
    };

    getWriteAttributes() {
        const {schema} = this.props;
        const {fileType} = this.state;
        const withColumns: any = {};
        if (fileType === 'schemaful_dsv') {
            withColumns.columns = _.map(schema, ({name}) => name);
        }
        return {
            ...withColumns,
            ...WRITE_ATTRIBUTES[fileType],
        };
    }

    onStartUpload(size: number) {
        this.setState({
            progress: {inProgress: true, event: {loaded: 0, total: size}},
            error: undefined,
        });
    }

    onUploadProgress = (event: ProgressEvent) => {
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

    onConfirm = () => {
        const {append} = this.state;
        if (append) {
            return this.onConfirmImpl();
        }

        this.setOverwriteConfirmationVisible(true);
    };

    onConfirmImpl = () => {
        const {file, fileType, append} = this.state;

        if (fileType === 'xlsx') {
            this.onXlsxUpload();
            return;
        }
        if (!file) {
            return;
        }

        const {path, proxy, cluster} = this.props;

        this.onStartUpload(file.size);

        let transaction_id = '';
        yt.v3
            .startTransaction({
                timeout: 120000,
            })
            .then((txId: string) => {
                transaction_id = txId;

                return yt.v3
                    .writeTable({
                        setup: {
                            onUploadProgress: this.onUploadProgress,
                            proxy: UPLOAD_CONFIG.uploadTableUseLocalmode
                                ? `${location.host}/localmode/api/yt/${cluster}`
                                : proxy,
                        },
                        parameters: {
                            transaction_id,
                            path: {$value: path, $attributes: {append}},
                            input_format: {
                                $value: fileType,
                                $attributes: this.getWriteAttributes(),
                            },
                        },
                        cancellation: this.cancelHelper.removeAllAndSave,
                        data: file,
                    })
                    .then(() => {
                        return yt.v3.commitTransaction({transaction_id}).then(() => {
                            this.onStopUpload();
                        });
                    });
            })
            .catch((e: any) => {
                this.onStopUpload(e);
                if (transaction_id) {
                    yt.v3.abortTransaction({transaction_id});
                }
            });
    };

    onXlsxUpload() {
        const {file, fileType} = this.state;
        if (!file || fileType !== 'xlsx') {
            return Promise.resolve();
        }

        const {path, cluster} = this.props;
        this.onStartUpload(file.size);

        const readyUrl = `${EXCEL_BASE_URL}/${cluster}/api/ready`;
        const uploadUrl = `${EXCEL_BASE_URL}/${cluster}/api/upload`;

        this.cancelHelper.removeAllRequests();
        return axios.get(readyUrl).then(
            () => {
                const {append, firstRowAsNames, secondRowAsTypes} = this.state;
                const start_row = [firstRowAsNames, secondRowAsTypes].filter(Boolean).length + 1;
                const params = new URLSearchParams({
                    path,
                    append: String(append),
                    header: String(firstRowAsNames),
                    start_row: String(start_row),
                    types: String(secondRowAsTypes),
                });
                const formData = new FormData();
                formData.append('uploadfile', file);
                return axios
                    .post(`${uploadUrl}?${params}`, formData, {
                        onUploadProgress: this.onUploadProgress,
                        withCredentials: true,
                        xsrfCookieName: getXsrfCookieName(cluster),
                        xsrfHeaderName: 'X-Csrf-Token',
                        cancelToken: this.cancelHelper.generateNextToken(),
                    })
                    .then(
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
    }

    handleClose = () => {
        if (this.inProgress()) {
            return;
        }
        this.props.handleClose();
    };

    setOverwriteConfirmationVisible(showOverwriteConfirmation: boolean) {
        this.setState({showOverwriteConfirmation});
    }

    renderOverwriteConfirmationDialog() {
        const {showOverwriteConfirmation} = this.state;
        return !showOverwriteConfirmation ? null : (
            <Modal
                size={'s'}
                title={'Overwrite confirmation'}
                visible={true}
                confirmText={'Overwrite'}
                content={
                    <div>
                        Are you sure you want to overwrite all existing data rows with the ones from
                        the uploading file?
                    </div>
                }
                onConfirm={() => {
                    this.setOverwriteConfirmationVisible(false);
                    this.onConfirmImpl();
                }}
                onCancel={() => {
                    this.setOverwriteConfirmationVisible(false);
                }}
            />
        );
    }

    render() {
        const {visible, handleShow} = this.props;
        return (
            <React.Fragment>
                <Button size="m" title="Upload" onClick={handleShow}>
                    <Icon awesome="upload" />
                    &nbsp; Upload
                </Button>

                {visible && (
                    <Modal
                        size="m"
                        title="Upload"
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

                {this.renderOverwriteConfirmationDialog()}
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state: RootState) => {
    const path: string = getPath(state);
    const schema = getSchema(state);
    const {proxy} = getCurrentClusterConfig(state);

    return {
        path,
        schema,
        cluster: getCluster(state),
        proxy,
    };
};

const mapDispatchToProps = {
    updateView,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default compose(withVisible, connector)(UploadManager);
