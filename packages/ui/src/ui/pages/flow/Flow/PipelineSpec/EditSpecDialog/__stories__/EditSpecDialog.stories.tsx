import React from 'react';
import {type Meta, type StoryObj} from '@storybook/react';

import {EditSpecDialog, type SpecEditOptions} from '../EditSpecDialog';

type Props = Pick<
    React.ComponentProps<typeof EditSpecDialog>,
    'allowForce' | 'withComment' | 'requireComment' | 'allowCommentOnly'
> & {submitError?: boolean};

function SpecEditor({submitError, ...props}: Props) {
    const [visible, setVisible] = React.useState(true);
    const [applied, setApplied] = React.useState<{spec: unknown; options: SpecEditOptions}>();
    return (
        <>
            <EditSpecDialog
                {...props}
                visible={visible}
                path="//home/test/flow"
                name="dynamic specification"
                title="Update patch"
                specCaption="Diff"
                spec={{batch_duration: 1001}}
                initialComment="Initial reason"
                settings={{format: 'json'}}
                onClose={() => setVisible(false)}
                onSpecApply={async (spec, options) => {
                    if (submitError) throw new Error('Cannot save specification');
                    setApplied({spec, options});
                }}
            />
            <output aria-label="Applied specification">{JSON.stringify(applied)}</output>
        </>
    );
}

const meta: Meta<typeof SpecEditor> = {
    title: 'Pages/Flow/EditSpecDialog',
    component: SpecEditor,
};
export default meta;
type Story = StoryObj<typeof SpecEditor>;

export const Comment: Story = {
    args: {withComment: true, requireComment: true, allowCommentOnly: true},
};
export const ValueRequired: Story = {
    args: {withComment: true, requireComment: true},
};
export const SaveError: Story = {
    args: {...Comment.args, submitError: true},
};
