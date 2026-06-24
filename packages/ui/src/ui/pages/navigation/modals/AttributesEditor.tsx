import React from 'react';
import {Button, Flex, Link} from '@gravity-ui/uikit';
import {ArrowUpRightFromSquare} from '@gravity-ui/icons';

import isEmpty_ from 'lodash/isEmpty';
import isEqual_ from 'lodash/isEqual';
import map_ from 'lodash/map';
import pickBy_ from 'lodash/pickBy';
import reduce_ from 'lodash/reduce';

import cn from 'bem-cn-lite';

import ypath from '../../../common/thor/ypath';

// @ts-ignore
import {
    DialogError,
    type DialogField,
    type DialogTabField,
    type FormApi,
    YTDFDialog,
} from '../../../containers/Dialog';

import {
    invalidateYTAnnotation,
    useExternalDescriptionQuery,
} from '../../../store/api/navigation/tabs/description';
import {
    selectNavigationAttributesEditorAttributes,
    selectNavigationAttributesEditorDynamicTables,
    selectNavigationAttributesEditorError,
    selectNavigationAttributesEditorMapNodes,
    selectNavigationAttributesEditorPath,
    selectNavigationAttributesEditorStaticTables,
    selectNavigationAttributesEditorVisible,
} from '../../../store/selectors/navigation/modals/attributes-editor';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    hideNavigationAttributesEditor,
    navigationSetNodeAttributes,
} from '../../../store/actions/navigation/modals/attributes-editor';
import {getMediumListNoCache} from '../../../store/selectors/thor';

import {selectCluster} from '../../../store/selectors/global';
import {selectPath} from '../../../store/selectors/navigation';

import {
    InMemoryMode,
    type InMemoryModeType,
    StorageOptions,
    compressionCodecValueFromString,
    compressionCodecValueToString,
    erasureCodecFromStorageOption,
    normalizeErasureCodec,
    storageOptionFromErasureCodec,
} from '../../../utils/cypress-attributes';
import {makeLink} from './CreateTableModal/CreateTableModal';
import {
    selectCompressionCodecs,
    selectErasureCodecs,
} from '../../../store/selectors/global/supported-features';
import {docsUrl} from '../../../config';

import './AttributesEditor.scss';
import UIFactory from '../../../UIFactory';
import i18n from './i18n';

const block = cn('navigation-attributes-editor');

interface FormValues {
    general: {
        path: Array<{title: string}>;
        account: string;
        primary_medium: string;
        tablet_cell_bundle: string;
        in_memory_mode: InMemoryModeType | '';

        expiration_time: {from?: string | number};
        expiration_timeout: {value: number};
    };
    storage: {
        path: Array<{title: string}>;
        optimize_for: 'lookup' | 'scan';
        compression_codec: Array<string>;
        erasure_codec: string;
        replication_factor: number;

        runMerge: true;
        _storageOption: 'replication' | 'erasure';
    };
    description: {
        annotation: {value: string};
    };
}

// eslint-disable-next-line complexity
function AttributesEditorLoaded() {
    const paths = useSelector(selectNavigationAttributesEditorPath);
    const attributesMap = useSelector(selectNavigationAttributesEditorAttributes);

    const singleMode = !(paths?.length! > 1);
    const attributes = paths?.length === 1 ? attributesMap[paths[0]] : {};

    const mediumList = useSelector(getMediumListNoCache);
    const dispatch = useDispatch();
    const storeError = useSelector(selectNavigationAttributesEditorError);

    const [stateError, setErr] = React.useState<any>(undefined);
    const [currentTab, setCurrentTab] = React.useState<string | undefined>();

    const error = stateError || storeError;

    const handleClose = React.useCallback(() => {
        dispatch(hideNavigationAttributesEditor());
    }, [dispatch]);

    const hasMapNodes = useSelector(selectNavigationAttributesEditorMapNodes).length > 0;
    const hasStaticTables = useSelector(selectNavigationAttributesEditorStaticTables).length > 0;
    const hasDynamicTables = useSelector(selectNavigationAttributesEditorDynamicTables).length > 0;

    const hasTables = hasStaticTables || hasDynamicTables || hasMapNodes; // map-node is required for inheritance
    const hasDynTableOrMapNode = hasMapNodes || hasDynamicTables;

    const erasureCodec = ypath.getValue(attributes, '/@erasure_codec');

    const pathsValues = React.useMemo(
        () =>
            map_(paths, (item) => {
                return {
                    title: item,
                };
            }),
        [paths],
    );

    const annotationInitial = {
        value: ypath.getValue(attributes, '/@annotation'),
    };
    const initialValues: FormValues = {
        general: {
            path: pathsValues,
            account: ypath.getValue(attributes, '/@account') || '',
            primary_medium: ypath.getValue(attributes, '/@primary_medium') || '',
            tablet_cell_bundle: ypath.getValue(attributes, '/@tablet_cell_bundle') || '',
            in_memory_mode: ypath.getValue(attributes, '/@in_memory_mode'),

            expiration_time: {from: ypath.getValue(attributes, '/@expiration_time')},
            expiration_timeout: {value: ypath.getValue(attributes, '/@expiration_timeout')},
        },
        storage: {
            path: pathsValues,
            optimize_for: ypath.getValue(attributes, '/@optimize_for') || 'lookup',
            compression_codec: compressionCodecValueFromString(
                ypath.getValue(attributes, '/@compression_codec'),
            ),
            erasure_codec: normalizeErasureCodec(erasureCodec),
            replication_factor: ypath.getValue(attributes, '/@replication_factor'),

            runMerge: true,
            _storageOption:
                storageOptionFromErasureCodec(erasureCodec) || StorageOptions.REPLICATION,
        },
        description: {
            annotation: annotationInitial,
        },
    };

    const tmp = ypath.getValue(attributes, '/@annotation_path');
    const annotationPath = paths && tmp !== paths[0] ? tmp : undefined;

    const handleAdd = React.useCallback(
        async (form: FormApi<FormValues, FormValues>) => {
            try {
                const {values} = form.getState();
                const {general, storage, description} = values;

                const initials = {
                    ...initialValues.general,
                    ...initialValues.storage,
                };

                const dataDiff = reduce_(
                    {...general, ...storage, ...description},
                    (acc, value, key) => {
                        if (!isEqual_(value, (initials as any)[key])) {
                            (acc as any)[key] = value;
                        }
                        return acc;
                    },
                    {} as Partial<typeof initials>,
                );

                if (dataDiff.in_memory_mode === '') {
                    delete dataDiff.in_memory_mode;
                }

                const {
                    account,
                    primary_medium,
                    tablet_cell_bundle,
                    in_memory_mode,
                    compression_codec,
                    erasure_codec,
                    replication_factor,
                    _storageOption,
                    optimize_for,
                } = dataDiff;

                const generalAttributes: any = {
                    account,
                    primary_medium,
                    tablet_cell_bundle,
                    in_memory_mode,
                };

                const storageAttributes: Partial<
                    Omit<FormValues['storage'], 'compression_codec'> & {
                        compression_codec: string;
                    }
                > = {};

                if (optimize_for) {
                    storageAttributes['optimize_for'] = optimize_for;
                }

                if (compression_codec) {
                    storageAttributes['compression_codec'] =
                        compressionCodecValueToString(compression_codec);
                }
                if (_storageOption) {
                    storageAttributes['erasure_codec'] = erasureCodecFromStorageOption(
                        _storageOption,
                        erasure_codec,
                    );
                }
                if (storage._storageOption === StorageOptions.REPLICATION) {
                    if (replication_factor) {
                        storageAttributes['replication_factor'] = Number(replication_factor);
                    }
                } else if (erasure_codec) {
                    storageAttributes['erasure_codec'] = erasureCodecFromStorageOption(
                        _storageOption,
                        erasure_codec,
                    );
                }

                const {
                    annotation: {value: annotation},
                } = description;

                const generalAttrs = pickBy_(generalAttributes, (v) => v !== undefined);
                if (general.expiration_time.from !== initialValues.general.expiration_time.from) {
                    generalAttrs.expiration_time = general.expiration_time.from;
                }

                if (general.expiration_timeout.value !== initials.expiration_timeout.value) {
                    generalAttrs.expiration_timeout = general.expiration_timeout.value;
                }

                await dispatch(
                    navigationSetNodeAttributes(
                        {
                            ...generalAttrs,
                            ...Object.assign(
                                {},
                                annotation === annotationInitial.value
                                    ? {}
                                    : {
                                          annotation,
                                      },
                            ),
                        },
                        storageAttributes,
                        hasStaticTables && storage.runMerge,
                    ),
                );
                dispatch(invalidateYTAnnotation());
            } catch (e) {
                setErr(e);
                throw e;
            }
        },
        [dispatch, initialValues, setErr],
    );

    const mergeNoticeAndError: Array<DialogField<FormValues>> = [];

    if (hasStaticTables) {
        mergeNoticeAndError.push({
            name: 'runMergeNotice',
            type: 'block',
            visibilityCondition: {
                when: 'storage.runMerge',
                isActive: (runMerge: boolean) => !runMerge,
            },
            extras: {
                children: (
                    <span className={block('run-notice')}>{i18n('alert_run-merge-manually')}</span>
                ),
            },
        });
    }
    if (error) {
        mergeNoticeAndError.push({
            name: 'error',
            type: 'block' as const,
            extras: {
                children: <DialogError error={error} />,
            },
        });
    }

    const annotationTab: Array<DialogTabField<DialogField<FormValues>>> = [];

    if (singleMode) {
        const fields: Array<DialogField<FormValues>> = [
            {
                name: 'annotation',
                type: 'annotation' as const,
                fullWidth: true,
                extras: {
                    valuePath: annotationPath,
                    className: block('full-height'),
                    initialValue: annotationInitial,
                },
            },
            ...mergeNoticeAndError,
        ];

        annotationTab.push({
            name: 'description',
            type: 'tab-vertical',
            title: i18n('title_description'),
            fields,
        });
    }

    const inMemoryModeField: DialogField = {
        name: 'in_memory_mode', // the attribute is not inheritable, so we do not need to display for map-nodes
        type: 'radio' as const,
        caption: i18n('field_in-memory-mode'),
        extras: {
            options: [
                {value: InMemoryMode.NONE, label: i18n('value_none')},
                {value: InMemoryMode.COMPRESSED, label: i18n('value_compressed')},
                {value: InMemoryMode.UNCOMPRESSED, label: i18n('value_uncompressed')},
            ],
        },
        tooltip: docsUrl(makeLink(UIFactory.docsUrls['dynamic-tables:overview#in_memory'])),
    };

    const optimizeForField: DialogField = {
        name: 'optimize_for',
        type: 'radio',
        caption: i18n('field_optimize-for'),
        tooltip: docsUrl(makeLink(UIFactory.docsUrls['storage:chunks#optimize_for'])),
        extras: {
            options: [
                {value: 'scan', label: i18n('value_scan')},
                {value: 'lookup', label: i18n('value_lookup')},
            ],
        },
    };

    const compressionCodecs = useSelector(selectCompressionCodecs);
    const erasureCodecs = useSelector(selectErasureCodecs);

    return (
        <YTDFDialog
            className={block({'single-mode': singleMode})}
            visible={true}
            onAdd={handleAdd}
            onClose={handleClose}
            size={'l'}
            validate={validateForm}
            headerProps={{
                title: i18n('title_edit-attributes'),
            }}
            initialValues={initialValues}
            fields={[
                {
                    name: 'general',
                    title: i18n('title_general'),
                    type: 'tab-vertical',
                    fields: [
                        {
                            name: 'path',
                            type: 'editable-list',
                            caption: i18n('field_path'),
                            extras: {
                                frozen: true,
                                className: block('path-list'),
                            },
                        },
                        {
                            name: 'account',
                            type: 'usable-account',
                            caption: i18n('field_account'),
                            tooltip: docsUrl(makeLink(UIFactory.docsUrls['storage:accounts'])),
                            extras: {
                                placeholder: i18n('context_account-placeholder'),
                            },
                        },
                        {
                            name: 'primary_medium',
                            type: 'yt-select-single',
                            caption: i18n('field_primary-medium'),
                            tooltip: docsUrl(makeLink(UIFactory.docsUrls['storage:media#primary'])),
                            extras: {
                                placeholder: i18n('context_primary-medium-placeholder'),
                                items: mediumList.map((value: string) => {
                                    return {value, text: value};
                                }),
                                width: 'max',
                            },
                        },
                        ...(!hasDynTableOrMapNode
                            ? []
                            : [
                                  {
                                      name: 'tablet_cell_bundle',
                                      type: 'tablet-cell-bundle' as const,
                                      caption: i18n('field_tablet-cell-bundle'),
                                      tooltip: docsUrl(
                                          makeLink(
                                              UIFactory.docsUrls[
                                                  'dynamic-tables:concepts#tablet_cell_bundles'
                                              ],
                                          ),
                                      ),
                                      extras: {
                                          placeholder: i18n(
                                              'context_tablet-cell-bundle-placeholder',
                                          ),
                                      },
                                  },
                              ]),
                        ...(!hasDynamicTables ? [] : [inMemoryModeField]),
                        {
                            name: 'expiration_time',
                            type: 'datepicker',
                            caption: i18n('field_expiration-time'),
                            tooltip: docsUrl(makeLink(UIFactory.docsUrls['cypress:ttl'])),
                            extras: {
                                format: 'yyyy-MM-dd HH:mm',
                                range: false,
                            },
                        },
                        {
                            name: 'expiration_timeout',
                            type: 'time-duration',
                            caption: i18n('field_expiration-timeout'),
                            tooltip: docsUrl(makeLink(UIFactory.docsUrls['cypress:ttl'])),
                        },
                        ...mergeNoticeAndError,
                    ],
                },
                {
                    name: 'storage',
                    type: 'tab-vertical',
                    title: i18n('title_storage'),
                    fields: [
                        {
                            name: 'path',
                            type: 'editable-list',
                            caption: i18n('field_path'),
                            extras: {
                                frozen: true,
                                className: block('path-list'),
                            },
                        },
                        ...(!hasTables ? [] : [optimizeForField]),
                        {
                            name: 'compression_codec',
                            type: 'select-with-subitems' as const,
                            caption: i18n('field_compression'),
                            tooltip: docsUrl(
                                makeLink(
                                    UIFactory.docsUrls['storage:compression#compression_codecs'],
                                ),
                            ),
                            extras: {
                                ...compressionCodecs,
                                disablePortal: false,
                            },
                        },
                        {
                            name: '_storageOption',
                            type: 'radio',
                            caption: i18n('field_storage-options'),
                            tooltip: docsUrl(
                                makeLink(UIFactory.docsUrls['storage:replication#replication']),
                            ),
                            extras: {
                                options: [
                                    {
                                        value: StorageOptions.REPLICATION,
                                        label: i18n('value_replication'),
                                    },
                                    {
                                        value: StorageOptions.ERASURE,
                                        label: i18n('value_erasure-encoding'),
                                    },
                                ],
                            },
                        },
                        {
                            name: 'replication_factor',
                            type: 'text',
                            caption: i18n('field_number-of-replicas'),
                            touched: true,
                            visibilityCondition: {
                                when: 'storage._storageOption',
                                isActive: (value: string) => value === StorageOptions.REPLICATION,
                            },
                            tooltip: docsUrl(
                                makeLink(UIFactory.docsUrls['storage:replication#replication']),
                            ),
                        },
                        {
                            name: 'erasure_codec',
                            type: 'yt-select-single',
                            caption: i18n('field_erasure-codec'),
                            tooltip: docsUrl(
                                makeLink(UIFactory.docsUrls['storage:replication#erasure']),
                            ),
                            visibilityCondition: {
                                when: 'storage._storageOption',
                                isActive: (value: string) => value === StorageOptions.ERASURE,
                            },
                            extras: {
                                items: erasureCodecs,
                                hideFilter: true,
                                width: 'max',
                            },
                        },
                        ...(!hasStaticTables
                            ? []
                            : [
                                  {
                                      name: 'runMerge',
                                      type: 'tumbler' as const,
                                      caption: i18n('field_run-merge-operation'),
                                      tooltip: <span>{i18n('context_run-merge-tooltip')}</span>,
                                  },
                              ]),
                        ...mergeNoticeAndError,
                    ],
                },
                ...annotationTab,
            ]}
            onActiveTabChange={(tab) => setCurrentTab(tab)}
            footerProps={{
                content: currentTab === 'description' && <CreateExternalDescriptionButton />,
            }}
        />
    );
}

function CreateExternalDescriptionButton() {
    const path = useSelector(selectPath);
    const cluster = useSelector(selectCluster);

    const {data: externalDescription} = useExternalDescriptionQuery({cluster, path});
    const {path: externalAnnotaionPath, externalAnnotationLink} = externalDescription ?? {};

    const createUrl = UIFactory.externalAnnotationSetup?.makeCreateUrl?.({cluster, path});

    const url = path !== externalAnnotaionPath ? createUrl : externalAnnotationLink;

    return (
        <>
            {url && (
                <Link href={url} target={'_blank'}>
                    <Button view={'outlined'} size={'l'}>
                        <Flex alignItems={'center'} gap={1}>
                            {UIFactory?.externalAnnotationSetup?.externalServiceName ||
                                i18n('action_create-external-description')}{' '}
                            {i18n('context_recommended')}
                            <ArrowUpRightFromSquare />
                        </Flex>
                    </Button>
                </Link>
            )}
        </>
    );
}

export default function AttributesEditor() {
    const path = useSelector(selectNavigationAttributesEditorPath);
    const visible = useSelector(selectNavigationAttributesEditorVisible);

    if (!path?.length || !visible) {
        return null;
    }
    return <AttributesEditorLoaded />;
}

function validateReplicationFactor(str: string): string | undefined {
    const v = parseInt(str);
    if (!str || (String(str) === String(v) && v >= 1 && v <= 20)) {
        return undefined;
    }

    return i18n('alert_replication-factor-invalid');
}

function validateStorage(storage: any) {
    const replication_factor = validateReplicationFactor(storage.replication_factor);
    if (storage._storageOption !== StorageOptions.REPLICATION || !replication_factor) {
        return undefined;
    }
    return {replication_factor};
}

function validateForm({storage}: FormValues) {
    const res: any = {
        storage: validateStorage(storage),
    };
    const ret = pickBy_(res, (v) => !isEmpty_(v));
    return ret;
}
