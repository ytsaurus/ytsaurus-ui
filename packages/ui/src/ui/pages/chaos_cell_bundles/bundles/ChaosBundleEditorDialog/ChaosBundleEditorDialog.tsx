import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import capitalize_ from 'lodash/capitalize';

import {Dialog, Progress} from '@gravity-ui/uikit';

import hammer from '../../../../common/hammer';
import ypath from '../../../../common/thor/ypath';
import Button from '../../../../components/Button/Button';
import ErrorBlock from '../../../../components/Error/Error';
import Icon from '../../../../components/Icon/Icon';
import QuotaEditorWithHide from '../../../../components/QuotaEditor/QuotaEditorWithHide';
import Tabs from '../../../../components/Tabs/Tabs';
import {Bold} from '../../../../components/Text/Text';
import {AccountsSuggestWithLoading} from '../../../../pages/accounts/AccountsSuggest';
import {WithHeader} from '../../../../pages/accounts/tabs/general/Editor/content/GeneralContent';
import type {
    BundleResourceType,
    EditBundleParams,
    setBundleQuota,
    setBunndleAttributes,
} from '../../../../store/actions/tablet_cell_bundles/tablet-cell-bundle-editor';
import {ChaosCellBundleEditorState} from '../../../../store/reducers/chaos_cell_bundles/tablet-cell-bundle-editor';
import {isDeveloper} from '../../../../store/selectors/global/is-developer';
import {calcProgressProps} from '../../../../utils/utils';

import './ChaosBundleEditorDialog.scss';
import UIFactory from '../../../../UIFactory';

const block = cn('chaos-editor');

const TABS = [
    {
        value: 'general',
        text: 'General',
        show: true,
    },
    {
        value: 'resources',
        text: 'Resources',
        show: true,
    },
];

export interface Props {
    bundleEditorData: ChaosCellBundleEditorState;
    hideBundleEditor(): void;
    setBundleQuota: typeof setBundleQuota;
    setBunndleAttributes: typeof setBunndleAttributes;
}

export function ChaosBundleEditorDialog({
    bundleEditorData,
    hideBundleEditor,
    setBundleQuota,
    setBunndleAttributes,
}: Props) {
    const {visibleEditor, bundleName, error} = bundleEditorData;

    const [activeTab, setActiveTab] = React.useState(TABS[0].value);

    const dispatch = useDispatch();
    const onClose = React.useCallback(() => {
        dispatch(hideBundleEditor());
    }, []);

    return !visibleEditor ? null : (
        <Dialog open={true} onClose={onClose}>
            <Dialog.Header caption={<React.Fragment>{bundleName}</React.Fragment>} />
            <Dialog.Divider />
            <Dialog.Body className={block('body')}>
                <div className={block('body-tabs')}>
                    <Tabs
                        items={TABS}
                        size="m"
                        layout="vertical"
                        active={activeTab}
                        onTabChange={setActiveTab}
                    />
                </div>
                <div className={block('body-tab-content')}>
                    {activeTab === 'resources' && (
                        <React.Fragment>
                            <ChaosBundleResourceUsage
                                bundleEditorData={bundleEditorData}
                                resourceType={'tablet_count'}
                                setBundleQuota={setBundleQuota}
                            />
                            <ChaosBundleResourceUsage
                                bundleEditorData={bundleEditorData}
                                resourceType={'tablet_static_memory'}
                                setBundleQuota={setBundleQuota}
                            />
                            {error && <ErrorBlock error={error} />}
                        </React.Fragment>
                    )}
                    {activeTab === 'general' && (
                        <ChaosBundleEditorGeneral
                            bundleEditorData={bundleEditorData}
                            setBunndleAttributes={setBunndleAttributes}
                        />
                    )}
                </div>
            </Dialog.Body>
        </Dialog>
    );
}

interface ChaosBundleResourceUsageProps {
    bundleEditorData: ChaosCellBundleEditorState;
    resourceType: BundleResourceType;
    setBundleQuota: typeof setBundleQuota;
}

function ChaosBundleResourceUsage({
    bundleEditorData,
    resourceType,
    setBundleQuota,
}: ChaosBundleResourceUsageProps) {
    const {data} = bundleEditorData;

    const limit = ypath.getValue(data, `/@resource_limits/${resourceType}`);
    const usage = ypath.getValue(data, `/@resource_usage/${resourceType}`);

    const [showEditor, setShowEditor] = React.useState(false);

    const toggleEditor = React.useCallback(() => {
        setShowEditor(!showEditor);
    }, [showEditor, setShowEditor]);

    const {value = 0, theme, text} = calcProgressProps(usage, limit, FORMATS[resourceType]);

    return (
        <div className={block('item')}>
            <div className={block('name-usage')}>
                <div className={block('name')}>
                    <Bold>{hammer.format['Readable'](resourceType)}</Bold>
                </div>
                <Progress className={block('progress')} value={value} theme={theme} text={text} />
                <Button view="flat-secondary" onClick={toggleEditor}>
                    <Icon awesome={'pencil'} />
                </Button>
            </div>
            {showEditor && (
                <ChaosBundleResourceEditor
                    bundleEditorData={bundleEditorData}
                    resourceType={resourceType}
                    setBundleQuota={setBundleQuota}
                    toggleVisibility={toggleEditor}
                />
            )}
        </div>
    );
}

const FORMATS: {[resourceType: string]: 'Number' | 'Bytes'} = {
    tablet_count: 'Number',
    tablet_static_memory: 'Bytes',
};

interface ChaosBundleResourceEditorProps {
    bundleEditorData: ChaosCellBundleEditorState;
    resourceType: BundleResourceType;
    setBundleQuota: typeof setBundleQuota;
    toggleVisibility(): void;
}

function ChaosBundleResourceEditor({
    bundleEditorData,
    resourceType,
    setBundleQuota,
    toggleVisibility,
}: ChaosBundleResourceEditorProps) {
    const {bundleName = '', data} = bundleEditorData;

    const limit = ypath.getValue(data, `/@resource_limits/${resourceType}`);
    const value = ypath.getValue(data, `/@resource_usage/${resourceType}`);

    const dispatch = useDispatch();

    const onSave = React.useCallback(
        (limit: number) => {
            dispatch(setBundleQuota({bundleName, resourceType, limit}));
        },
        [resourceType],
    );

    return (
        <QuotaEditorWithHide
            format={FORMATS[resourceType]}
            limit={limit}
            onHide={toggleVisibility}
            onSave={onSave}
            getInfoByName={() => ({limit, total: value})}
            currentAccount={bundleName}
            parentOfCurrentAccount={''}
            max={Infinity}
        />
    );
}

interface ChaosBundleEditorGeneralProps {
    bundleEditorData: ChaosCellBundleEditorState;
    setBunndleAttributes: typeof setBunndleAttributes;
}

function ChaosBundleEditorGeneral({
    bundleEditorData,
    setBunndleAttributes,
}: ChaosBundleEditorGeneralProps) {
    return (
        <React.Fragment>
            <ChaosBundleAbcServiceEditor
                bundleEditorData={bundleEditorData}
                setBunndleAttributes={setBunndleAttributes}
            />
            <ChaosBundleAccountEditor
                attributeName={'changelog_account'}
                bundleEditorData={bundleEditorData}
                setBunndleAttributes={setBunndleAttributes}
            />
            <ChaosBundleAccountEditor
                attributeName={'snapshot_account'}
                bundleEditorData={bundleEditorData}
                setBunndleAttributes={setBunndleAttributes}
            />
        </React.Fragment>
    );
}

interface ChaosBundleAbcServiceEditorProps {
    bundleEditorData: ChaosCellBundleEditorState;
    setBunndleAttributes: typeof setBunndleAttributes;
}

function ChaosBundleAbcServiceEditor({
    bundleEditorData,
    setBunndleAttributes,
}: ChaosBundleAbcServiceEditorProps) {
    const {bundleName, data} = bundleEditorData;
    const slug = ypath.getValue(data, '/@abc/slug');
    const allowEdit = useSelector(isDeveloper);

    const dispatch = useDispatch();
    const onAbcChange = React.useCallback(({id, slug}: {id?: number; slug?: string} = {}) => {
        if (!bundleName) {
            throw new Error('Name of bundle cannot be empty');
        }
        dispatch(
            setBunndleAttributes(bundleName, {
                attributes: {
                    abc: id && slug ? {id, slug} : undefined,
                },
            }),
        );
    }, []);

    const control = UIFactory.renderControlAbcService({
        value: {slug},
        onChange: onAbcChange,
        placeholder: 'Select ABC service...',
        disabled: !allowEdit,
    });

    return !control ? null : (
        <WithHeader header={'ABC Service'}>
            <>{control}</>
        </WithHeader>
    );
}

interface ChaosBundleAccountEditorProps {
    attributeName: keyof EditBundleParams['options'];
    bundleEditorData: ChaosCellBundleEditorState;
    setBunndleAttributes: typeof setBunndleAttributes;
}

function ChaosBundleAccountEditor(props: ChaosBundleAccountEditorProps) {
    const {attributeName, bundleEditorData, setBunndleAttributes} = props;
    const {bundleName, data} = bundleEditorData;
    const account = ypath.getValue(data, `/@options/${attributeName}`);
    const allowEdit = useSelector(isDeveloper);

    const dispatch = useDispatch();
    const onChange = React.useCallback((value?: string) => {
        if (!bundleName) {
            throw new Error('Name of bundle cannot be empty');
        }
        dispatch(
            setBunndleAttributes(bundleName, {
                options: {[attributeName]: value},
            }),
        );
    }, []);

    return (
        <WithHeader header={`${capitalize_(attributeName)} account`}>
            <AccountsSuggestWithLoading
                value={account || ''}
                onChange={onChange}
                disabled={!allowEdit}
                allowRootAccount={true}
            />
        </WithHeader>
    );
}
