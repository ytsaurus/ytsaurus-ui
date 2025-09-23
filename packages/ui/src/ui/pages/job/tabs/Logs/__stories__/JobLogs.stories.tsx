import React from 'react';
import {type Meta, type StoryObj} from '@storybook/react';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {JobLogsWithStore} from './helpers';
import {jobLogsListHandler, jobLogsViewHandler} from './mocks';

yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');

export default {
    title: 'Pages/Job/JobLogs',
    component: JobLogsWithStore,
    argTypes: {
        incarnations: {
            description: 'Array of incarnation data to display',
            control: false,
        },
        isLoading: {
            control: 'boolean',
            description: 'Loading state indicator',
        },
    },
} as Meta;

const BaseComponent = () => <JobLogsWithStore />;

export const Default: StoryObj = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [jobLogsViewHandler, jobLogsListHandler],
        },
    },
};
