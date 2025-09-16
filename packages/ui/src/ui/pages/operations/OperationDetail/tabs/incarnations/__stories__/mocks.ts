import {http} from 'msw';
import {type Incarnations} from '../../../../../../store/selectors/operations/incarnations';
import {OperationDetailSuccessActionData} from '../../../../../../store/reducers/operations/detail';
import {OperationEvent} from '../../../../../../../shared/yt-types';

export const operationData: OperationDetailSuccessActionData = {
    operation: {
        finishTime: '2024-01-15T11:55:00Z',
        id: '123',
        $typedAttributes: undefined,
        live_preview: undefined,
        getLivePreviewPath: () => ({path: '', virtualPath: ''}),
        $value: '',
        $attributes: undefined,
        state: 'completed',
        pools: [],
        isRunning: () => false,
        isPreparing: () => false,
        inIntermediateState: () => false,
        successfullyCompleted: () => true,
        computePools: () => {},
    },
    actions: [],
    details: {
        alert_events: [],
        runtime: undefined,
        specification: undefined,
        resources: undefined,
        error: undefined,
        events: undefined,
        intermediateResources: undefined,
    },
};

export const mockIncarnations: Incarnations = [
    {
        id: 'incarnation-1',
        interval: '2024-01-15 10:00 — 10:30',
        switch_info: {
            trigger_job_id: '55d99491-46b071c4-42e0384-5000ba2',
            abort_reason: 'allocation_finished',
            trigger_job_error: {
                code: 1,
                message: 'Allocation finished concurrently with settling job',
                attributes: {
                    pid: 93709,
                    tid: 14016941903464638000,
                    thread: 'Controller:10',
                    fid: 18445260849922996000,
                    datetime: '2025-08-12T11:21:54.485092Z',
                    trace_id: '34f415c8-ef78485c-eeac114a-d4fef217',
                    span_id: 2252474309918773000,
                    abort_reason: 'allocation_finished',
                },
            },
        },
        trigger_job_id: 'job-123',
        finish_reason: 'Operation completed',
        finish_status: 'completed',
        switch_reason: 'job_completed',
    },
    {
        id: 'incarnation-2',
        interval: '2024-01-15 10:30 — 11:00',
        switch_info: {
            reason: 'job_failed',
            error: 'Memory limit exceeded',
        },
        trigger_job_id: 'job-456',
        finish_reason: 'Job failed',
        finish_status: 'failed',
        switch_reason: 'job_failed',
    },
    {
        id: 'incarnation-3',
        interval: '2024-01-15 11:00 — 11:45',
        switch_info: {
            reason: 'system_restart',
        },
        finish_reason: 'System',
        finish_status: 'unknown',
        switch_reason: 'system_restart',
    },
];

const operationEvents: OperationEvent[] = [
    {
        timestamp: '2025-08-26T18:40:38.030543Z',
        event_type: 'incarnation_started',
        incarnation: 'e07939a7-4a046870-2a11cd64-a61c7a53',
        incarnation_switch_reason: 'job_aborted',
        incarnation_switch_info: {
            trigger_job_id: '9b07f58e-fbc50e28-42e0384-b000d5f',
            abort_reason: 'allocation_finished',
            trigger_job_error: {
                code: 1,
                message: 'Allocation finished concurrently with settling job',
                attributes: {
                    pid: 491,
                    tid: 13434584954681207000,
                    thread: 'Controller:15',
                    fid: 18445563064851315000,
                    datetime: '2025-08-26T18:40:38.030308Z',
                    trace_id: 'd4a040f0-61745b09-eb1bffb8-c16dda92',
                    span_id: 12461814460693740000,
                    abort_reason: 'allocation_finished',
                },
            },
        },
    },
    {
        timestamp: '2025-08-12T13:10:24.287399Z',
        event_type: 'incarnation_started',
        incarnation: '5acf6fc2-2bd550d2-d1aca892-161662b2',
        incarnation_switch_reason: 'job_aborted',
        incarnation_switch_info: {
            trigger_job_id: 'bd9cf65-5501bb61-42e0384-100127b',
            abort_reason: 'operation_aborted',
            trigger_job_error: {
                code: 1101,
                message: 'Job aborted by scheduler',
                attributes: {
                    pid: 535,
                    tid: 17257201325304982000,
                    thread: 'Job',
                    fid: 18446428706581098000,
                    datetime: '2025-08-12T13:10:24.287086Z',
                    trace_id: '26720ec6-b59b4563-fdb77672-64b932e8',
                    span_id: 2407879054165195300,
                    abort_reason: 'operation_aborted',
                },
            },
        },
    },
    {
        timestamp: '2025-08-07T07:50:23.859284Z',
        event_type: 'incarnation_started',
        incarnation: '1b300024-abd4f4c4-d9ff576a-9989d2c0',
        incarnation_switch_info: {},
    },
    {
        timestamp: '2025-08-06T21:55:07.558997Z',
        event_type: 'incarnation_started',
        incarnation: 'e484d2a3-96166916-f1a1fb78-84a0c3f7',
        incarnation_switch_reason: 'job_failed',
        incarnation_switch_info: {
            trigger_job_id: 'bcb0a5d2-5fdc55b6-42e0384-1001423',
            trigger_job_error: {
                code: 1205,
                message: 'User job failed',
                attributes: {
                    pid: 59,
                    tid: 12803899801913328000,
                    thread: 'JobMain',
                    fid: 18446439024968813000,
                    datetime: '2025-08-06T21:50:50.031596Z',
                    trace_id: '69e4ddc0-85accc4a-5d751ea8-99a9d7d9',
                    span_id: 8848875849542489000,
                },
                inner_errors: [
                    {
                        code: 10000,
                        message: 'Process exited with code 37',
                        attributes: {
                            pid: 59,
                            tid: 6938844173464082000,
                            thread: 'Porto:environ',
                            fid: 18446438974679753000,
                            datetime: '2025-08-06T21:50:50.031298Z',
                            trace_id: '69e4ddc0-85accc4a-5d751ea8-99a9d7d9',
                            span_id: 8848875849542489000,
                            exit_code: 37,
                        },
                    },
                ],
            },
        },
    },
];

export const operationEventsHandler = http.post(
    'https://test-cluster.yt.my-domain.com/api/v4/list_operation_events',
    () => {
        return Response.json(operationEvents);
    },
);

export const operationEventsHandlerWithLoading = http.post(
    'https://test-cluster.yt.my-domain.com/api/v4/list_operation_events',
    async () => {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return Response.json([]);
    },
);

export const operationEventsHandlerEmpty = http.post(
    'https://test-cluster.yt.my-domain.com/api/v4/list_operation_events',
    () => {
        return Response.json([]);
    },
);

export const operationEventsHandlerError = http.post(
    'https://test-cluster.yt.my-domain.com/api/v4/list_operation_events',
    () => {
        return Response.error();
    },
);
