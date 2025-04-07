import React, {useCallback, useState} from 'react';
import {Button, Flex, Text} from '@gravity-ui/uikit';
import b from 'bem-cn-lite';

import {useExportMutation} from '../../../../../../../store/api/navigation/tabs/queue/queue';

import Icon from '../../../../../../../components/Icon/Icon';
import {YTDFDialog} from '../../../../../../../components/Dialog';
import {QueueExportConfig} from '../../../../../../../types/navigation/queue/queue';

import {ExportsEditDialog} from '../ExportsEditDialog/ExportsEditDialog';

const block = b('exports-edit');

export function ExportsEdit({
    prevConfig,
}: {
    prevConfig: QueueExportConfig<number> & {export_name: string};
}) {
    const [update] = useExportMutation();

    const [editDialogVisible, setEditDialogVisible] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

    const toggleEditDialogVisibility = useCallback(() => {
        setEditDialogVisible(!editDialogVisible);
    }, [editDialogVisible, setEditDialogVisible]);

    const toggleDeleteDialogVisibility = useCallback(() => {
        setDeleteDialogVisible(!deleteDialogVisible);
    }, [deleteDialogVisible, setDeleteDialogVisible]);

    return (
        <>
            <Flex direction={'row'} gap={1}>
                <Button view="flat" onClick={toggleDeleteDialogVisibility}>
                    <Icon awesome={'trash-bin'} />
                </Button>
                <Button
                    className={block('button')}
                    view="flat"
                    onClick={toggleEditDialogVisibility}
                    qa={'edit-export'}
                >
                    <Icon awesome={'pencil'} />
                </Button>
            </Flex>
            <YTDFDialog
                visible={deleteDialogVisible}
                pristineSubmittable={true}
                fields={[
                    {
                        name: 'delete',
                        type: 'block',
                        extras: {
                            children: (
                                <Text variant="body-2">
                                    Are you shure you want to delete {prevConfig.export_name}?
                                </Text>
                            ),
                        },
                    },
                ]}
                onAdd={async () => {
                    update({prevConfig, type: 'delete'});
                }}
                headerProps={{
                    title: 'Delete export',
                }}
                onClose={toggleDeleteDialogVisibility}
            />
            <ExportsEditDialog
                type={'edit'}
                prevConfig={prevConfig}
                visible={editDialogVisible}
                onClose={toggleEditDialogVisibility}
            />
        </>
    );
}
