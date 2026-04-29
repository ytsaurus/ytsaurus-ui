import isEmpty_ from 'lodash/isEmpty';
import sortedIndexOf_ from 'lodash/sortedIndexOf';
import React, {useCallback, useMemo, useState} from 'react';
import Button from '../../../../components/Button/Button';
import {type FormApi, YTDFDialog} from '../../../../components/Dialog';
import {YTErrorBlock} from '../../../../components/Error/Error';
import Link from '../../../../components/Link/Link';
import {docsUrl, isIdmAclAvailable} from '../../../../config';
import {uiSettings} from '../../../../config/ui-settings';
import {SCHEDULING_CREATE_POOL_CANCELLED} from '../../../../constants/scheduling';
import {
    createPool,
    fetchCreatePoolDialogTreeItems,
} from '../../../../store/actions/scheduling/create-pool-dialog';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {selectCurrentUserName} from '../../../../store/selectors/global';
import {
    getCreatePoolDialogError,
    getCreatePoolDialogFlatTreeItems,
} from '../../../../store/selectors/scheduling/create-pool-dialog';
import {
    getIsRoot,
    getPool,
    getTree,
    getTreesSelectItems,
} from '../../../../store/selectors/scheduling/scheduling';
import {type FIX_MY_TYPE} from '../../../../types';
import UIFactory from '../../../../UIFactory';
import {type ResponsibleType} from '../../../../utils/acl/acl-types';
import i18n from './i18n';

const allowRoot = !uiSettings.schedulingDenyRootAsParent;

export default function CreatePoolButton() {
    const dispatch = useDispatch();

    const isRoot = useSelector(getIsRoot);

    const [visible, changeVisibility] = useState(false);
    const handleShow = useCallback(() => changeVisibility(true), [changeVisibility]);
    const handleClose = useCallback(() => {
        changeVisibility(false);
        dispatch({type: SCHEDULING_CREATE_POOL_CANCELLED});
    }, [dispatch, changeVisibility]);

    return (
        <React.Fragment>
            <Button view="action" disabled={!allowRoot && isRoot} onClick={handleShow}>
                {i18n('action_create-pool')}
            </Button>
            {visible && <CreatePoolDialog onClose={handleClose} />}
        </React.Fragment>
    );
}

interface FormValues {
    name: string;
    tree: string;
    parent: string;
    responsible: Array<ResponsibleType>;
    abcService: {value: string; id: number; title: string};
}

function CreatePoolDialog(props: {onClose: () => void}) {
    const dispatch = useDispatch();
    const treeStored: string = useSelector(getTree);
    const [tree, setTree] = React.useState(treeStored);
    const handleTreeChange = React.useCallback(
        (newTree: string | undefined) => {
            setTree(newTree!);
            dispatch(fetchCreatePoolDialogTreeItems(newTree!));
        },
        [dispatch],
    );
    React.useEffect(() => {
        dispatch(fetchCreatePoolDialogTreeItems(tree));
    }, [dispatch]);

    const error = useSelector(getCreatePoolDialogError);

    const login = useSelector(selectCurrentUserName);
    const treeItems = useSelector(getTreesSelectItems);
    const pool = useSelector(getPool);

    const handleCreateConfirm = useCallback(
        (form: FormApi<FormValues>) => {
            const {values} = form.getState();
            return dispatch(createPool(values));
        },
        [dispatch],
    );
    const initialValues = useMemo(() => {
        // const slug = ypath.getValue(poolData, '/abc/slug');
        return {
            // abcService: slug ? {
            //     key: slug,
            //     value: slug,
            //     id: ypath.getValue(poolData, '/abc/id'),
            //     title: ypath.getValue(poolData, '/abc/name'),
            // } : undefined,
            tree,
            parent: pool,
            responsible: [
                {
                    value: login,
                    type: 'users',
                },
            ],
        };
    }, [tree, pool, login]);

    const [name, setName] = React.useState('');
    const handleNameChange = React.useCallback(
        (newName: string) => {
            setName(newName);
        },
        [setName],
    );

    const {sortedFlatTree} = useSelector(getCreatePoolDialogFlatTreeItems);

    const validateForm = React.useCallback(
        (values: FormValues): null | {name?: string} => {
            const {name} = values;
            const res: Partial<Record<keyof FormValues, string>> = {};
            if (-1 !== sortedIndexOf_(sortedFlatTree, name)) {
                res.name = i18n('alert_name-not-unique');
            }
            return isEmpty_(res) ? null : res;
        },
        [sortedFlatTree],
    );

    const isApplyDisabled = React.useMemo(
        () => (form: {values: FormValues}) => {
            const errors = validateForm(form.values);
            return Boolean(errors);
        },
        [validateForm],
    );

    return (
        <YTDFDialog
            visible={true}
            onClose={props.onClose}
            headerProps={{
                title: i18n('title_create-pool'),
            }}
            onAdd={handleCreateConfirm as FIX_MY_TYPE}
            initialValues={{
                ...initialValues,
                name,
            }}
            validate={validateForm as FIX_MY_TYPE}
            isApplyDisabled={isApplyDisabled}
            pristineSubmittable={true}
            fields={[
                {
                    name: 'name',
                    type: 'text',
                    caption: i18n('field_name'),
                    required: true,
                    extras: {
                        placeholder: i18n('field_enter-pool-name'),
                    },
                    onChange: handleNameChange,
                    touched: Boolean(name),
                },
                {
                    name: 'tree',
                    type: 'yt-select-single',
                    caption: i18n('field_pool-tree'),
                    tooltip: (
                        <span>
                            {i18n('context_pool-tree')}{' '}
                            {docsUrl(
                                <>
                                    {i18n('action_see')}{' '}
                                    <Link url={UIFactory.docsUrls['scheduler:scheduler_and_pools']}>
                                        {i18n('action_documentation')}
                                    </Link>{' '}
                                    {i18n('context_pool-tree-docs-suffix')}
                                </>,
                            )}
                        </span>
                    ),
                    required: true,
                    extras: {
                        hideFilter: true,
                        items: treeItems,
                        placeholder: i18n('field_select-pool-tree'),
                        width: 'max',
                    },
                    onChange: (value: string | Array<string> | undefined) => {
                        handleTreeChange(value as string);
                    },
                },
                {
                    name: 'parent',
                    type: 'create-pool-parent',
                    caption: i18n('field_parent'),
                    tooltip: i18n('context_parent'),
                    required: !allowRoot,
                    extras: {
                        placeholder: i18n('field_select-parent'),
                    },
                },
                ...(!isIdmAclAvailable()
                    ? []
                    : [
                          {
                              name: 'responsible',
                              type: 'acl-subjects' as const,
                              caption: i18n('field_responsible-users'),
                              tooltip: i18n('context_responsible-users'),
                              required: true,
                              extras: {
                                  placeholder: i18n('field_select-responsible-users'),
                              },
                          },
                      ]),
                {
                    name: 'error-block',
                    type: 'block',
                    extras: {
                        children: error && <YTErrorBlock error={error} />,
                    },
                },
            ]}
        />
    );
}
