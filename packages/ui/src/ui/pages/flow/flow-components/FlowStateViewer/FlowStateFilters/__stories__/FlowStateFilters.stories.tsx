import React from 'react';
import {type Meta, type StoryFn, type StoryObj} from '@storybook/react';

import AttributesModal from '../../../../../../containers/AttributesModal/AttributesModal';
import type {FlowStaticSpec} from '../../../../../../../shared/yt-types';
import {FlowStateResultsActions} from '../../FlowStateResults/FlowStateResults';
import {FlowStateFilters} from '../FlowStateFilters';

const staticSpec: FlowStaticSpec = {
    computations: {
        checkout: {
            group_by_schema: [
                {name: 'hash', type: 'uint64', expression: 'farm_hash(user_id)'},
                {name: 'user_id', type: 'uint64'},
            ],
        },
    },
};

const meta: Meta<typeof FlowStateFilters> = {
    title: 'Pages/Flow/FlowStateFilters',
    component: FlowStateFilters,
    decorators: [
        (Story: StoryFn) => (
            <div style={{width: '100%', maxWidth: 1200, padding: 20}}>
                <Story />
                <AttributesModal />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof FlowStateFilters>;

export const TwoRowToolbar: Story = {
    args: {
        pipeline_path: '//home/flow/pipeline',
        value: {computationId: 'checkout', target: 'all', keyValues: {}},
        onChange: () => {},
        onReset: () => {},
        staticSpec,
        actions: (
            <FlowStateResultsActions
                response={{key_states: [], partition_states: []}}
                refreshing={false}
                hasScope
                initialLoading={false}
                readSucceeded={false}
            />
        ),
    },
};
