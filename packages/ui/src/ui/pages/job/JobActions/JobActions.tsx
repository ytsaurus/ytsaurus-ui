import React, {useCallback, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import copy from 'copy-to-clipboard';
import cn from 'bem-cn-lite';
import _ from 'lodash';
// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {ButtonProps, Dialog, DropdownMenu, Toaster} from '@gravity-ui/uikit';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import PathEditor from '../../../containers/PathEditor/PathEditor';
import Button from '../../../components/Button/Button';
import Link from '../../../components/Link/Link';
import Icon, {IconName} from '../../../components/Icon/Icon';

import {getJob, getJobActions} from '../../../store/selectors/job/detail';
import {loadJobData} from '../../../store/actions/job/general';
import {promptAction} from '../../../store/actions/actions';
import {getCluster} from '../../../store/selectors/global';
import {RootState} from '../../../store/reducers';
import {PreparedJob} from '../../../types/job';
import {showErrorPopup} from '../../../utils/utils';
import hammer from '../../../common/hammer';
import {YTError} from '../../../types';

import './JobActions.scss';

type ActionName = 'interrupt' | 'abort' | 'abandon';

interface OptionAction {
    value: string;
    text: string;
    data: Record<string, any>;
}

export interface Action {
    icon: IconName;
    modalKey: string;
    name: ActionName;
    successMessage: string;
    confirmationText?: string;
    theme?: ButtonProps['view'];
    message?: string | JSX.Element;

    optionMessage?: string;
    optionValue?: string | number;
    optionType?: string;
    options?: OptionAction[];
}

interface IntermediateAction extends Action {
    message: string | JSX.Element;
    handler: ({currentOption}: Record<string, any>) => void;
}

const toaster = new Toaster();
const block = cn('job-actions');
const codeBlock = cn('elements-code');

const getAdditionalActions = (
    job: PreparedJob,
    openJobShellModal: () => void,
    openDumpContextModal: () => void,
) => {
    const infoActions = [
        {
            action: () => {
                window.open(job.prepareCommandURL('get_job_input'));
            },
            text: 'get_job_input',
        },
        {
            action: () => {
                window.open(job.prepareCommandURL('get_job_stderr'));
            },
            text: 'get_job_stderr',
        },
    ];

    if (job.state === 'failed') {
        infoActions.push({
            action: () => {
                window.open(job.prepareCommandURL('get_job_fail_context'));
            },
            text: 'get_job_fail_context',
        });
    } else {
        infoActions.push({
            action: openDumpContextModal,
            text: 'dump_job_context',
        });
    }

    const jobShallAction = [
        {
            action: openJobShellModal,
            text: 'job shell',
        },
    ];

    return [infoActions, jobShallAction];
};

interface PerformAction {
    currentOption?: number;
    name: ActionName;
    id: string;
}

interface YTParameters {
    job_id: string;
    interrupt_timeout?: number;
    path?: string;
}

const getActionAction = (name: ActionName) => {
    const mapper = {
        interrupt: yt.v4.abortJob,
        abort: yt.v4.abortJob,
        abandon: yt.v4.abandonJob,
    };

    return mapper[name];
};

const performAction = ({currentOption, name, id}: PerformAction) => {
    const actionAction = getActionAction(name);
    let parameters: YTParameters = {job_id: id};
    if (currentOption) {
        parameters = {
            ...parameters,
            interrupt_timeout: currentOption,
        };
    }

    return actionAction(parameters);
};

const dumpJobContext = (id: string, path: string, cluster: string) => {
    const parameters: YTParameters = {job_id: id, path};

    return yt.v3
        .dumpJobContext(parameters)
        .then(() => {
            toaster.createToast({
                type: 'success',
                allowAutoHiding: false,
                name: 'dump job context',
                title: 'Job context has been dumped.',
                content: <Link url={`/${cluster}/navigation?path=${path}`}>{path}</Link>,
            });
        })
        .catch((err: YTError) => {
            toaster.createToast({
                type: 'error',
                allowAutoHiding: false,
                name: 'dump job context',
                title: 'Could not dump job context.',
                content: err?.message || 'Oops, something went wrong',
                actions: [{label: ' view', onClick: () => showErrorPopup(err)}],
            });
        });
};

function ActionBlock(action: Action) {
    const dispatch = useDispatch();

    const message = action.message || (
        <span>
            Are you sure you want to <strong>{action.name}</strong> the job?
        </span>
    );
    const {job} = useSelector((state: RootState) => state.job.general);
    const {id, operationId} = job as PreparedJob;

    const update = useCallback(() => {
        const reset = () => dispatch(loadJobData(operationId, id));
        setTimeout(reset, 5000);
    }, [dispatch, operationId, id]);
    const intermediateAction = useCallback(
        (data: IntermediateAction) => dispatch(promptAction(data)),
        [dispatch],
    );
    const handler = useCallback(
        ({currentOption}: Record<string, number>) => {
            const data = {...action, currentOption, id};
            return performAction(data).then(update);
        },
        [id, action, update],
    );
    const onClick = useCallback(
        () => dispatch(intermediateAction({...action, message, handler})),
        [dispatch, intermediateAction, action, message, handler],
    );

    return (
        <Button
            size="m"
            key={action.name}
            onClick={onClick}
            view={action.theme || 'outlined'}
            className={block('action')}
            title={hammer.format['ReadableField'](action.name)}
        >
            <Icon awesome={action.icon} />
            &nbsp;
            {hammer.format['ReadableField'](action.name)}
        </Button>
    );
}

export default function JobActions() {
    const job = useSelector(getJob);
    const {loaded} = useSelector((state: RootState) => state.job.general);
    const cluster = useSelector(getCluster);
    const jobId = (job as PreparedJob).id;

    const jobShellCommand = `yt run-job-shell ${jobId}`;
    const [jobShellVisible, setJobShellVisible] = useState(false);
    const openJobShellModal = useCallback(() => setJobShellVisible(true), [setJobShellVisible]);
    const closeJobShellModal = useCallback(() => setJobShellVisible(false), [setJobShellVisible]);
    const onCopyClick = useCallback(() => {
        copy(jobShellCommand);
        closeJobShellModal();
    }, [jobShellCommand, closeJobShellModal]);

    const defaultPath = '//home';
    const [dumpContextPath, setDumpContextPath] = useState(defaultPath);
    const [dumpContextVisible, setDumpContextVisible] = useState(false);
    const onPathEditorChange = useCallback(
        (path: string) => setDumpContextPath(path),
        [setDumpContextPath],
    );
    const openDumpContextModal = useCallback(
        () => setDumpContextVisible(true),
        [setDumpContextVisible],
    );
    const closeDumpContextModal = useCallback(
        () => setDumpContextVisible(false),
        [setDumpContextVisible],
    );
    const onDumpContextConfirm = useCallback(() => {
        dumpJobContext(jobId, dumpContextPath, cluster);
        closeDumpContextModal();
    }, [jobId, dumpContextPath, cluster, closeDumpContextModal]);

    const actions = useSelector(getJobActions);
    const additionalActions = useMemo(
        () => getAdditionalActions(job, openJobShellModal, openDumpContextModal),
        [job, openJobShellModal, openDumpContextModal],
    );

    if (!loaded) {
        return null;
    }

    return (
        <ErrorBoundary>
            <div className={block()}>
                {_.map(actions, (action: Action) => (
                    <ActionBlock {...action} />
                ))}
                <DropdownMenu items={additionalActions} />

                <Dialog size="m" open={jobShellVisible} onClose={closeJobShellModal}>
                    <Dialog.Header caption="Job shell" />
                    <Dialog.Body>
                        <div className={block('code')}>
                            <div className={codeBlock({theme: 'default'})}>{jobShellCommand}</div>
                        </div>
                    </Dialog.Body>
                    <Dialog.Footer
                        onClickButtonCancel={closeJobShellModal}
                        onClickButtonApply={onCopyClick}
                        textButtonCancel="Cancel"
                        textButtonApply="Copy"
                        showError={false}
                        preset="success"
                        listenKeyEnter
                    />
                </Dialog>

                <Dialog size="m" open={dumpContextVisible} onClose={closeDumpContextModal}>
                    <Dialog.Header caption="Dump job context" />
                    <Dialog.Body>
                        <div className={block('dump-context')}>
                            <PathEditor
                                hasClear
                                defaultPath={defaultPath}
                                onChange={onPathEditorChange}
                            />
                        </div>
                    </Dialog.Body>
                    <Dialog.Footer
                        onClickButtonCancel={closeDumpContextModal}
                        onClickButtonApply={onDumpContextConfirm}
                        textButtonCancel="Cancel"
                        textButtonApply="Confirm"
                        showError={false}
                        preset="success"
                        listenKeyEnter
                    />
                </Dialog>
            </div>
        </ErrorBoundary>
    );
}
