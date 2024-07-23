import React, {useCallback, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import sortedIndexOf_ from 'lodash/sortedIndexOf';
import isEmpty_ from 'lodash/isEmpty';

import Link from '../../../../components/Link/Link';
import Error from '../../../../components/Error/Error';
import {FormApi, YTDFDialog} from '../../../../components/Dialog/Dialog';
import Button from '../../../../components/Button/Button';

import {getCurrentUserName} from '../../../../store/selectors/global';
import {
    getIsRoot,
    getPool,
    getTree,
    getTreesSelectItems,
} from '../../../../store/selectors/scheduling/scheduling';

import {
    createPool,
    fetchCreatePoolDialogTreeItems,
} from '../../../../store/actions/scheduling/create-pool-dialog';
import {
    getCreatePoolDialogError,
    getCreatePoolDialogFlatTreeItems,
} from '../../../../store/selectors/scheduling/create-pool-dialog';
import {FIX_MY_TYPE} from '../../../../types';
import {SCHEDULING_CREATE_POOL_CANCELLED} from '../../../../constants/scheduling';
import {docsUrl, isIdmAclAvailable} from '../../../../config';
import UIFactory from '../../../../UIFactory';
import {uiSettings} from '../../../../config/ui-settings';

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
                Create pool
            </Button>
            {visible && <CreatePoolDialog onClose={handleClose} />}
        </React.Fragment>
    );
}

interface FormValues {
    name: string;
    tree: string;
    parent: string;
    responsible: {value: string; id: string | number; title: string};
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

    const login = useSelector(getCurrentUserName);
    const treeItems = useSelector(getTreesSelectItems);
    const pool = useSelector(getPool);

    const handleCreateConfirm = useCallback(
        (form: FormApi) => {
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
                res.name = 'the value must be unique';
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
                title: 'Create pool',
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
                    caption: 'Name',
                    required: true,
                    extras: {
                        placeholder: 'Enter pool name...',
                    },
                    onChange: handleNameChange,
                    touched: Boolean(name),
                },
                {
                    name: 'tree',
                    type: 'yt-select-single',
                    caption: 'Pool tree',
                    tooltip: (
                        <span>
                            Select pool tree where to create new pool.{' '}
                            {docsUrl(
                                <>
                                    See{' '}
                                    <Link url={UIFactory.docsUrls['scheduler:scheduler_and_pools']}>
                                        Documentations
                                    </Link>{' '}
                                    for more details.
                                </>,
                            )}
                        </span>
                    ),
                    required: true,
                    extras: {
                        hideFilter: true,
                        items: treeItems,
                        placeholder: 'Select pool tree...',
                        width: 'max',
                    },
                    onChange: (value: string | Array<string> | undefined) => {
                        handleTreeChange(value as string);
                    },
                },
                {
                    name: 'parent',
                    type: 'create-pool-parent',
                    caption: 'Parent',
                    tooltip:
                        'Select parent pool, defining a place in pool_tree to place a new pool.',
                    required: !allowRoot,
                    extras: {
                        placeholder: 'Select parent...',
                    },
                },
                ...(!isIdmAclAvailable()
                    ? []
                    : [
                          {
                              name: 'responsible',
                              type: 'acl-subjects' as const,
                              caption: 'Responsible users',
                              tooltip:
                                  'Choose responsible users who will manage permissions and pool settings.',
                              required: true,
                              extras: {
                                  placeholder: 'Select responsible users...',
                              },
                          },
                      ]),
                {
                    name: 'error-block',
                    type: 'block',
                    extras: {
                        children: error && <Error error={error} />,
                    },
                },
            ]}
        />
    );
}
