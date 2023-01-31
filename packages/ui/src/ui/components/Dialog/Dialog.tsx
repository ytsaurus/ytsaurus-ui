import React, {ComponentProps} from 'react';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import SubjectsControl from '../ACL/SubjectsControl/SubjectsControl';
import PermissionsControl from '../../components/ACL/RequestPermissions/PermissionsControl/PermissionsControl';
import AccountsSuggest, {AccountsSuggestWithLoading} from '../../pages/accounts/AccountsSuggest';
import GroupSuggest from '../../pages/components/GroupSuggest/GroupSuggest';

import ClusterSelectControl from './controls/ClusterSelectControl/ClusterSelectControl';

import SortableListControl from '../../components/Dialog/controls/SortableListControl/SortableListControl';
import BytesControl, {NumberControl} from '../../components/Dialog/controls/BytesControl';
import RoleListControl from './controls/RoleListControl/RoleListControl';
import CreateTableTabField from '../../navigation/Navigation/PathEditorModal/CreateTableModal/CreateTableTabField/CreateTableTabField';
import {
    GroupSuggestControl,
    LockSuggestControl,
} from '../../navigation/Navigation/PathEditorModal/CreateTableModal/CreateTableSuggests/CreateTableSuggests';
import SelectWithSubItems from './controls/SelectWithSubItems/SelectWithSubItems';
import CreatePoolParentSuggest from '../../pages/scheduling/Instruments/CreatePoolDialog/CreatePoolParentSuggest';
import TabletCellBundlesSuggest from '../../pages/components/TabletCellBundlesSuggest/TabletCellBundlesSuggest';
import Block from '../../components/Block/Block';
import EditablePathList from './controls/EditablePathList/EditablePathList';
import {PathEditorControl} from './controls/PathEditorControl/PathEditorControl';

import './Dialog.scss';
import {PoolSuggestControl} from './controls/PoolSuggestControl/PoolSuggestControl';
import {PoolTreeSuggestControl} from './controls/PoolTreeSuggestControl/PoolTreeSuggestControl';
import {TableSortByControl} from '../../pages/navigation/modals/TableMergeSortModal/TableSortByControl';
import {TableChunkSize} from '../../pages/navigation/modals/TableMergeSortModal/TableChunkSize';
import {UsableAccountSuggest} from '../../pages/accounts/UsableAccountSuggest';
import AnnotationEditor from '../../pages/navigation/AnnotationEditor/AnnotationEditor';
import {
    DFDialog,
    DFDialogProps,
    DFDialogField,
    DFDialogTabField,
    registerDialogControl,
    RegisteredDialogField,
    registerDialogTabControl,
    RegisteredDialogTabField,
} from '@gravity-ui/dialog-fields';
export {FORM_ERROR} from '@gravity-ui/dialog-fields';
export type {FormApi} from '@gravity-ui/dialog-fields';
import {FIX_MY_TYPE, YTError} from '../../types';
import PoolQuotaEditor from '../../pages/scheduling/PoolQoutaEditor/PoolQuotaEditor';
import {BundleTableField} from '../../pages/tablet_cell_bundles/bundles/BundleEditorDialog/components/BundleTableField/BundleTableField';
import {BundleTitle} from '../../pages/tablet_cell_bundles/bundles/BundleEditorDialog/components/BundleTitle/BundleTitle';
import {BundleInput} from '../../pages/tablet_cell_bundles/bundles/BundleEditorDialog/components/BundleInput/BundleInput';
import {AbcControl} from './controls/AbcControl/AbcControl';
import Select, {SelectSingle} from '../../components/Select/Select';
import BeforeDatePicker from '../../components/common/BeforeDatePicker/BeforeDatePicker';

const block = cn('yt-dialog');

registerDialogControl('abc-control', AbcControl);
registerDialogControl('accountsSuggest', AccountsSuggest);
registerDialogControl('usable-account', UsableAccountSuggest);
registerDialogControl('accounts-suggest-with-loading', AccountsSuggestWithLoading);

registerDialogControl('cluster', ClusterSelectControl);

registerDialogControl('acl-subjects', SubjectsControl);
registerDialogControl('acl-roles', RoleListControl);
registerDialogControl('permissions', PermissionsControl);

registerDialogControl('yt-group', GroupSuggest);

registerDialogControl('sortable-list', SortableListControl);
registerDialogControl('bytes', BytesControl);
registerDialogControl('number', NumberControl);

registerDialogControl('select-with-subitems', SelectWithSubItems);
registerDialogControl('yt-select', Select);
registerDialogControl('yt-select-single', SelectSingle);

registerDialogControl('create-table-lock-suggest', LockSuggestControl);
registerDialogControl('create-table-group-suggest', GroupSuggestControl);

registerDialogControl('create-pool-parent', CreatePoolParentSuggest);

registerDialogControl('tablet-cell-bundle', TabletCellBundlesSuggest);

registerDialogControl('path', PathEditorControl);
registerDialogControl('editable-path-list', EditablePathList);

registerDialogControl('pool', PoolSuggestControl);
registerDialogControl('pool-tree', PoolTreeSuggestControl);

registerDialogControl('table-sort-by', TableSortByControl);
registerDialogControl('table-chunk-size', TableChunkSize);

registerDialogControl('annotation', AnnotationEditor);

registerDialogControl('pool-quota-editor', PoolQuotaEditor);

registerDialogControl('bundle-table-field', BundleTableField);
registerDialogControl('bundle-title', BundleTitle);
registerDialogControl('bundle-input', BundleInput);

registerDialogControl('before-date', BeforeDatePicker);

export type DialogField<FormValues = unknown> =
    | DFDialogField
    | RegisteredDialogField<'abc-control', ComponentProps<typeof AbcControl>, FormValues>
    | RegisteredDialogField<'accountsSuggest', ComponentProps<typeof AccountsSuggest>, FormValues>
    | RegisteredDialogField<
          'usable-account',
          ComponentProps<typeof UsableAccountSuggest>,
          FormValues
      >
    | RegisteredDialogField<
          'accounts-suggest-with-loading',
          ComponentProps<typeof AccountsSuggestWithLoading>,
          FormValues
      >
    | RegisteredDialogField<'cluster', ComponentProps<typeof ClusterSelectControl>, FormValues>
    | RegisteredDialogField<'acl-subjects', ComponentProps<typeof SubjectsControl>, FormValues>
    | RegisteredDialogField<'acl-roles', ComponentProps<typeof RoleListControl>, FormValues>
    | RegisteredDialogField<'permissions', ComponentProps<typeof PermissionsControl>, FormValues>
    | RegisteredDialogField<'yt-group', ComponentProps<typeof GroupSuggest>, FormValues>
    | RegisteredDialogField<'sortable-list', ComponentProps<typeof SortableListControl>, FormValues>
    | RegisteredDialogField<'bytes', ComponentProps<typeof BytesControl>, FormValues>
    | RegisteredDialogField<'number', ComponentProps<typeof NumberControl>, FormValues>
    | RegisteredDialogField<
          'select-with-subitems',
          ComponentProps<typeof SelectWithSubItems>,
          FormValues
      >
    | RegisteredDialogField<'yt-select', ComponentProps<typeof Select>, FormValues>
    | RegisteredDialogField<'yt-select-single', ComponentProps<typeof SelectSingle>, FormValues>
    | RegisteredDialogField<
          'create-table-lock-suggest',
          ComponentProps<typeof LockSuggestControl>,
          FormValues
      >
    | RegisteredDialogField<
          'create-table-group-suggest',
          ComponentProps<typeof GroupSuggestControl>,
          FormValues
      >
    | RegisteredDialogField<
          'create-pool-parent',
          ComponentProps<typeof CreatePoolParentSuggest>,
          FormValues
      >
    | RegisteredDialogField<
          'tablet-cell-bundle',
          ComponentProps<typeof TabletCellBundlesSuggest>,
          FormValues
      >
    | RegisteredDialogField<'path', ComponentProps<typeof PathEditorControl>, FormValues>
    | RegisteredDialogField<
          'editable-path-list',
          ComponentProps<typeof EditablePathList>,
          FormValues
      >
    | RegisteredDialogField<'pool', ComponentProps<typeof PoolSuggestControl>, FormValues>
    | RegisteredDialogField<'pool-tree', ComponentProps<typeof PoolTreeSuggestControl>, FormValues>
    | RegisteredDialogField<'table-sort-by', ComponentProps<typeof TableSortByControl>, FormValues>
    | RegisteredDialogField<'table-chunk-size', ComponentProps<typeof TableChunkSize>, FormValues>
    | RegisteredDialogField<'annotation', ComponentProps<typeof AnnotationEditor>, FormValues>
    | RegisteredDialogField<'pool-quota-editor', ComponentProps<typeof PoolQuotaEditor>, FormValues>
    | RegisteredDialogField<
          'bundle-table-field',
          ComponentProps<typeof BundleTableField>,
          FormValues
      >
    | RegisteredDialogField<'bundle-title', ComponentProps<typeof BundleTitle>, FormValues>
    | RegisteredDialogField<'bundle-input', ComponentProps<typeof BundleInput>, FormValues>
    | RegisteredDialogField<'before-date', ComponentProps<typeof BeforeDatePicker>, FormValues>;

registerDialogTabControl('yt-create-table-tab', CreateTableTabField);

export type DialogTabField<FieldT> =
    | DFDialogTabField<FieldT>
    | RegisteredDialogTabField<'yt-create-table-tab', any, FieldT>;

export default function YTInfraDialog<Values, InitialValues = Partial<Values>>(
    props: DFDialogProps<
        Values,
        InitialValues,
        DialogTabField<DialogField<Values>>,
        DialogField<Values>
    >,
) {
    return <DFDialog {...(props as any)} />;
}

export function DialogError(props: FIX_MY_TYPE) {
    return <Block {...props} className={block('error')} />;
}

export function makeErrorFields(errors: Array<YTError | Error | undefined>) {
    return _.compact(
        _.map(errors, (error, index) => {
            return error
                ? {
                      name: `error_${index}`,
                      type: 'block' as const,
                      extras: {
                          children: <DialogError error={error} />,
                      },
                  }
                : undefined;
        }),
    );
}
