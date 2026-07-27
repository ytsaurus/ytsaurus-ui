import {
    type FlowExtendedStremType,
    type FlowComputationType,
    type FlowMessageType,
} from '../../../../shared/yt-types';

export type FlowComputationRuntimeData = {
    input: FlowComputationUIStreamsSummary;
    output: FlowComputationUIStreamsSummary;
    timer: FlowComputationUIStreamsSummary;
};

export type FlowComputationUIStreamsSummary = {
    drained: boolean;
    backpressureDetected: boolean;

    messages: Array<FlowMessageType>;

    extendedStreams: Map<string, FlowExtendedStremType>;
};

export type FlowComputationRuntimeType = FlowComputationType & {runtimeData: FlowComputationRuntimeData};
