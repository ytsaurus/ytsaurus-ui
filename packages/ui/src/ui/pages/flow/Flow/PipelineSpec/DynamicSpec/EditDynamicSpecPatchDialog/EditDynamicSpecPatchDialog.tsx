import React from 'react';
import isEqual_ from 'lodash/isEqual';

import {type FlowDynamicSpecPatch, type Int64} from '../../../../../../../shared/yt-types';
import {type UnipikaSettings} from '../../../../../../components/Yson/StructuredYson/StructuredYsonTypes';
import {
    decodeDynamicSpecValue,
    dynamicSpecPatchChangesFromDiff,
    dynamicSpecPatchDiff,
    encodeDynamicSpecValue,
} from '../../../../../../utils/flow/dynamic-spec';
import {EditSpecDialog} from '../../EditSpecDialog/EditSpecDialog';
import {type DynamicSpecProps} from '../DynamicSpec';

import i18n from '../../i18n';

export function EditDynamicSpecPatchDialog({
    patch,
    version,
    pipelinePath,
    settings,
    onUpdate,
    onClose,
}: {
    patch: FlowDynamicSpecPatch;
    version: Int64;
    pipelinePath: string;
    settings: UnipikaSettings;
    onUpdate: DynamicSpecProps['onUpdate'];
    onClose: () => void;
}) {
    const value = React.useMemo(() => dynamicSpecPatchDiff(patch), [patch]);
    const spec = React.useMemo(() => decodeDynamicSpecValue(value), [value]);

    return (
        <EditSpecDialog
            path={pipelinePath}
            name="dynamic specification"
            visible
            spec={spec}
            settings={settings}
            withComment
            requireComment
            allowCommentOnly
            initialComment={patch.comment ?? ''}
            title={i18n('title_update-patch')}
            specCaption={i18n('field_diff')}
            onClose={onClose}
            onSpecApply={(edited, {comment}) => {
                const encoded = encodeDynamicSpecValue(edited, value);
                const changes = isEqual_(value, encoded)
                    ? undefined
                    : dynamicSpecPatchChangesFromDiff(patch, encoded);
                if (changes && !changes.length) {
                    throw new Error(i18n('error_patch-changes'));
                }
                return onUpdate(patch.patch_id, changes, comment ?? '', version);
            }}
        />
    );
}
