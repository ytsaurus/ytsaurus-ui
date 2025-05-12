import React, {ComponentProps} from 'react';
import cn from 'bem-cn-lite';

import SubjectsControl from '../../containers/ACL/SubjectsControl/SubjectsControl';
import PermissionsControl from '../../containers/ACL/RequestPermissions/PermissionsControl/PermissionsControl';
import {AclColumnGroupControl} from '../../containers/ACL/RequestPermissions/AclColumnGroupControl/AclColumnGroupControl';
import AccountsSuggest, {AccountsSuggestWithLoading} from '../../pages/accounts/AccountsSuggest';
import GroupSuggest from '../../pages/components/GroupSuggest/GroupSuggest';

import ClusterSelectControl from './controls/ClusterSelectControl/ClusterSelectControl';

import SortableListControl from '../../components/Dialog/controls/SortableListControl/SortableListControl';
import BytesControl, {NumberControl} from '../../components/Dialog/controls/BytesControl';
import RoleListControl from './controls/RoleListControl/RoleListControl';
import CreateTableTabField from '../../pages/navigation/modals/CreateTableModal/CreateTableTabField/CreateTableTabField';
import {
    GroupSuggestControl,
    LockSuggestControl,
} from '../../pages/navigation/modals/CreateTableModal/CreateTableSuggests/CreateTableSuggests';
import SelectWithSubItems from './controls/SelectWithSubItems/SelectWithSubItems';
import CreatePoolParentSuggest from '../../pages/scheduling/Instruments/CreatePoolDialog/CreatePoolParentSuggest';
import TabletCellBundlesSuggest from '../../pages/components/TabletCellBundlesSuggest/TabletCellBundlesSuggest';
import EditablePathList from './controls/EditablePathList/EditablePathList';
import {PathEditorControl} from './controls/PathEditorControl/PathEditorControl';
import {OutputPathControl} from './controls/OutputPathControl';
import {AccountsMultiple} from './controls/AccountsMultiple/AccountsMultiple';

import './Dialog.scss';
import {PoolSuggestControl} from './controls/PoolSuggestControl/PoolSuggestControl';
import {PoolTreeSuggestControl} from './controls/PoolTreeSuggestControl/PoolTreeSuggestControl';
import {TableSortByControl} from '../../pages/navigation/modals/TableMergeSortModal/TableSortByControl';
import {TableChunkSize} from '../../pages/navigation/modals/TableMergeSortModal/TableChunkSize';
import {UsableAccountSuggest} from '../../pages/accounts/UsableAccountSuggest';
import {EditAnnotationWithPreview} from '../EditAnnotationWithPreview/EditAnnotationWithPreview';
import {EditJsonWithPreview} from '../EditJsonWithPreview/EditJsonWithPreview';
import {
    // eslint-disable-next-line no-restricted-imports
    DFDialog,
    DFDialogField,
    DFDialogProps,
    DFDialogTabField,
    RegisteredDialogField,
    RegisteredDialogTabField,
    registerDialogControl,
    registerDialogTabControl,
} from '@gravity-ui/dialog-fields';
import PoolQuotaEditor from '../../pages/scheduling/PoolQoutaEditor/PoolQuotaEditor';
import {BundleTableField} from '../../pages/tablet_cell_bundles/bundles/BundleEditorDialog/components/BundleTableField/BundleTableField';
import {BundleTitle} from '../../pages/tablet_cell_bundles/bundles/BundleEditorDialog/components/BundleTitle/BundleTitle';
import {BundleInput} from '../../pages/tablet_cell_bundles/bundles/BundleEditorDialog/components/BundleInput/BundleInput';
import {AbcControl} from './controls/AbcControl/AbcControl';
import Select, {SelectSingle} from '../../components/Select/Select';
import BeforeDatePicker from './controls/BeforeDatePicker/BeforeDatePicker';
import {TimeDuration} from '../../components/TimeDuration/TimeDuration';
import {DatePickerControl} from './controls/DatePickerControl/DatePickerControl';
import {RangeInputPickerControl} from './controls/RangeInputPickerControl/RangeInputPickerControl';
import {AclColumnsControl} from '../../containers/ACL/RequestPermissions/AclColumnsControl/AclColumnsControl';
import {useHotkeysScope} from '../../hooks/use-hotkeysjs-scope';
import {PoolsMultiple} from './controls/PoolsMultiple/PoolsMultiple';
import {ServicesSelect} from './controls/ServicesSelect/ServicesSelect';

const block = cn('yt-dialog');

registerDialogControl('abc-control', AbcControl);
registerDialogControl('accountsSuggest', AccountsSuggest);
registerDialogControl('usable-account', UsableAccountSuggest);
registerDialogControl('accounts-suggest-with-loading', AccountsSuggestWithLoading);
registerDialogControl('accounts-with-presets', AccountsMultiple);

registerDialogControl('cluster', ClusterSelectControl);

registerDialogControl('acl-subjects', SubjectsControl);
registerDialogControl('acl-roles', RoleListControl);
registerDialogControl('acl-column-group', AclColumnGroupControl);
registerDialogControl('acl-columns', AclColumnsControl);
registerDialogControl('permissions', PermissionsControl);

registerDialogControl('yt-group', GroupSuggest);

registerDialogControl('sortable-list', SortableListControl);
registerDialogControl('bytes', BytesControl);
registerDialogControl('number', NumberControl);
registerDialogControl('time-duration', TimeDuration);

registerDialogControl('datepicker', DatePickerControl);

registerDialogControl('select-with-subitems', SelectWithSubItems);
registerDialogControl('yt-select', Select);
registerDialogControl('yt-select-single', SelectSingle);

registerDialogControl('create-table-lock-suggest', LockSuggestControl);
registerDialogControl('create-table-group-suggest', GroupSuggestControl);

registerDialogControl('create-pool-parent', CreatePoolParentSuggest);

registerDialogControl('tablet-cell-bundle', TabletCellBundlesSuggest);

registerDialogControl('path', PathEditorControl);
registerDialogControl('output-path', OutputPathControl);
registerDialogControl('editable-path-list', EditablePathList);

registerDialogControl('pool', PoolSuggestControl);
registerDialogControl('pool-tree', PoolTreeSuggestControl);
registerDialogControl('pools-multiple', PoolsMultiple);

registerDialogControl('table-sort-by', TableSortByControl);
registerDialogControl('table-chunk-size', TableChunkSize);

registerDialogControl('annotation', EditAnnotationWithPreview);

registerDialogControl('json', EditJsonWithPreview);

registerDialogControl('pool-quota-editor', PoolQuotaEditor);

registerDialogControl('bundle-table-field', BundleTableField);
registerDialogControl('bundle-title', BundleTitle);
registerDialogControl('bundle-input', BundleInput);

registerDialogControl('range-input-picker', RangeInputPickerControl);

registerDialogControl('before-date', BeforeDatePicker);

registerDialogControl('services-select', ServicesSelect);

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
    | RegisteredDialogField<
          'accounts-with-presets',
          ComponentProps<typeof AccountsMultiple>,
          FormValues
      >
    | RegisteredDialogField<'cluster', ComponentProps<typeof ClusterSelectControl>, FormValues>
    | RegisteredDialogField<'acl-subjects', ComponentProps<typeof SubjectsControl>, FormValues>
    | RegisteredDialogField<'acl-roles', ComponentProps<typeof RoleListControl>, FormValues>
    | RegisteredDialogField<
          'acl-column-group',
          ComponentProps<typeof AclColumnGroupControl>,
          FormValues
      >
    | RegisteredDialogField<'acl-columns', ComponentProps<typeof AclColumnsControl>, FormValues>
    | RegisteredDialogField<'permissions', ComponentProps<typeof PermissionsControl>, FormValues>
    | RegisteredDialogField<'yt-group', ComponentProps<typeof GroupSuggest>, FormValues>
    | RegisteredDialogField<'sortable-list', ComponentProps<typeof SortableListControl>, FormValues>
    | RegisteredDialogField<'bytes', ComponentProps<typeof BytesControl>, FormValues>
    | RegisteredDialogField<'number', ComponentProps<typeof NumberControl>, FormValues>
    | RegisteredDialogField<'time-duration', ComponentProps<typeof TimeDuration>, FormValues>
    | RegisteredDialogField<'datepicker', ComponentProps<typeof DatePickerControl>, FormValues>
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
    | RegisteredDialogField<'output-path', ComponentProps<typeof OutputPathControl>, FormValues>
    | RegisteredDialogField<
          'editable-path-list',
          ComponentProps<typeof EditablePathList>,
          FormValues
      >
    | RegisteredDialogField<'pool', ComponentProps<typeof PoolSuggestControl>, FormValues>
    | RegisteredDialogField<'pools-multiple', ComponentProps<typeof PoolsMultiple>, FormValues>
    | RegisteredDialogField<'pool-tree', ComponentProps<typeof PoolTreeSuggestControl>, FormValues>
    | RegisteredDialogField<'table-sort-by', ComponentProps<typeof TableSortByControl>, FormValues>
    | RegisteredDialogField<'table-chunk-size', ComponentProps<typeof TableChunkSize>, FormValues>
    | RegisteredDialogField<
          'annotation',
          ComponentProps<typeof EditAnnotationWithPreview>,
          FormValues
      >
    | RegisteredDialogField<'json', ComponentProps<typeof EditJsonWithPreview>, FormValues>
    | RegisteredDialogField<'pool-quota-editor', ComponentProps<typeof PoolQuotaEditor>, FormValues>
    | RegisteredDialogField<
          'bundle-table-field',
          ComponentProps<typeof BundleTableField>,
          FormValues
      >
    | RegisteredDialogField<'bundle-title', ComponentProps<typeof BundleTitle>, FormValues>
    | RegisteredDialogField<'bundle-input', ComponentProps<typeof BundleInput>, FormValues>
    | RegisteredDialogField<'before-date', ComponentProps<typeof BeforeDatePicker>, FormValues>
    | RegisteredDialogField<
          'range-input-picker',
          ComponentProps<typeof RangeInputPickerControl>,
          FormValues
      >
    | RegisteredDialogField<'services-select', ComponentProps<typeof ServicesSelect>, FormValues>;

registerDialogTabControl('yt-create-table-tab', CreateTableTabField);

export type DialogTabField<FieldT> =
    | DFDialogTabField<FieldT>
    | RegisteredDialogTabField<'yt-create-table-tab', any, FieldT>;

export type YTDialogType = typeof YTDialog;
export function YTDialog<Values, InitialValues = Partial<Values>>(
    props: DFDialogProps<
        Values,
        InitialValues,
        DialogTabField<DialogField<Values>>,
        DialogField<Values>
    > & {hotkeyScope?: string; asLeftTopBlock?: boolean},
) {
    const {modal, asLeftTopBlock, headerProps, hotkeyScope = 'yt-dialog'} = props;
    const dialog = <DFDialog {...(props as any)} modal={asLeftTopBlock ? false : modal} />;

    // We don't want to trigger any page hotkeys when dialog is visible,
    // therefore we switing to dialog hotkeys scope.
    useHotkeysScope(hotkeyScope, props.visible);

    return asLeftTopBlock ? (
        <div className={block('as-block', {['has-header']: Boolean(headerProps)})}>{dialog}</div>
    ) : (
        dialog
    );
}

export {registerDialogControl, registerDialogTabControl, RoleListControl};

// eslint-disable-next-line no-restricted-imports
export type * from '@gravity-ui/dialog-fields';
export {EditableList, TabFieldVertical} from '@gravity-ui/dialog-fields';
export type {ControlStaticApi} from '@gravity-ui/dialog-fields/build/cjs/dialog/types';
