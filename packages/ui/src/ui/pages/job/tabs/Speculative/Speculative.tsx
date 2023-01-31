/* eslint-disable camelcase */
import React, {useCallback, useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import LoadDataHandler from '../../../../components/LoadDataHandler/LoadDataHandler';
import ClipboardButton from '../../../../components/ClipboardButton/ClipboardButton';
import ElementsTableRaw from '../../../../components/ElementsTable/ElementsTable';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';
import Statuslabel from '../../../../components/StatusLabel/StatusLabel';
import Link from '../../../../components/Link/Link';

import ypath from '../../../../common/thor/ypath';
import {PreparedJob, RawJob} from '../../../../types/job';
import hammer from '../../../../common/hammer';
import {RootState} from '../../../../store/reducers';
import {getCluster} from '../../../../store/selectors/global';
import {loadCompetitors} from '../../../../store/actions/job/competitors';
import {OPERATION_JOBS_TABLE_ID} from '../../../../constants/operations/jobs';

import './Speculative.scss';

const block = cn('job-competitors');
const ElementsTable: any = ElementsTableRaw;

interface IdAddressProps {
    job: RawJob;
    operationId: string;
}

function IdAddress({job, operationId}: IdAddressProps) {
    const cluster = useSelector(getCluster);

    // @ts-ignore
    const [id, address, jobCompetitionId] = ypath.getValues(job, [
        '/id',
        '/address',
        '/job_competition_id',
    ]);
    const host = hammer.format['Address'](address);
    const isSpeculativeJob = jobCompetitionId && jobCompetitionId !== id;

    return (
        <div>
            <span className={block('id', 'elements-monospace elements-ellipsis')}>
                <ClipboardButton text={id} theme="flat-secondary" size="s" title="Copy job id" />
                <Link routed url={`/${cluster}/job/${operationId}/${id}`} theme={'primary'}>
                    {id}
                </Link>
            </span>
            <br />
            <span className={block('host', 'elements-monospace elements-ellipsis')}>
                <ClipboardButton text={host} view="flat-secondary" size="s" title="Copy host" />
                {host}
            </span>
            {isSpeculativeJob && (
                <React.Fragment>
                    <br />
                    <span
                        className={block(
                            'speculative-job-label',
                            'elements-monospace elements-ellipsis',
                        )}
                    >
                        Speculative job
                    </span>
                </React.Fragment>
            )}
        </div>
    );
}

const getTableColumns = () => {
    return {
        items: {
            id_address: {
                name: 'id_address',
                align: 'left',
                caption: 'Id / Address',
                sort: false,
            },
            state: {
                name: 'type',
                align: 'right',
                sort: true,
            },
            type: {
                name: 'type',
                align: 'right',
                sort: true,
            },
        },
        sets: {
            default: {
                items: ['id_address', 'type', 'state'],
            },
        },
        mode: 'default',
    };
};

interface SpeculativeJobsTemplates {
    id_address: (el: RawJob) => JSX.Element;
    state: (el: RawJob) => JSX.Element;
}

const getTableTemplates = (operationId: string): SpeculativeJobsTemplates => {
    return {
        id_address(item: RawJob) {
            return <IdAddress job={item} operationId={operationId} />;
        },
        state(item: RawJob) {
            return <Statuslabel label={item.state} />;
        },
    };
};

export default function Competitors() {
    const dispatch = useDispatch();
    const computeKey = useCallback((item: PreparedJob) => item.id, []);
    const {job} = useSelector((state: RootState) => state.job.general);
    const {loading, loaded, error, errorData, competitors} = useSelector(
        (state: RootState) => state.job.competitors,
    );

    const {jobCompetitionId, operationId} = job;
    if (!jobCompetitionId || !operationId) {
        throw new Error('Unexpected behavior: jobCompetitionId or operationId is not defined');
    }

    const columns = useMemo(getTableColumns, []);
    const templates = useMemo(() => getTableTemplates(operationId), [operationId]);

    useEffect(() => {
        dispatch(loadCompetitors(operationId, jobCompetitionId));
    }, [dispatch, operationId, jobCompetitionId]);

    return (
        <ErrorBoundary>
            <div className={block({loading})}>
                <LoadDataHandler loaded={loaded} error={error} errorData={errorData}>
                    <ElementsTable
                        size="s"
                        theme="light"
                        css={block()}
                        virtual={false}
                        striped={false}
                        columns={columns}
                        isLoading={loading}
                        items={competitors}
                        templates={templates}
                        computeKey={computeKey}
                        tableId={OPERATION_JOBS_TABLE_ID}
                    />
                </LoadDataHandler>
            </div>
        </ErrorBoundary>
    );
}
