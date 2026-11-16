import React from 'react';
import {NoContent} from '../../../../components/NoContent';
import {ArrowUpRightFromSquare} from '@gravity-ui/icons';
import {Button, Flex, Icon, Text} from '@gravity-ui/uikit';
import {useSelector} from '../../../../store/redux-hooks';
import {selectCluster} from '../../../../store/selectors/global';
import {selectPath} from '../../../../store/selectors/navigation';
import {getDescriptionType} from '../../../../store/reducers/navigation/description';
import UIFactory from '../../../../UIFactory';
import {useDescriptionActions} from '../hooks/use-description-actions';
import i18n from './i18n';

export function NavigationDescriptionEmpty() {
    const cluster = useSelector(selectCluster);
    const path = useSelector(selectPath);
    const descriptionType = useSelector(getDescriptionType);
    const {edit} = useDescriptionActions();
    const external = UIFactory.externalAnnotationSetup;
    const createUrl = external?.makeCreateUrl?.({cluster, path});

    return (
        <NoContent
            warning={i18n('title_no-description')}
            imageSize={100}
            padding="large"
            hint={
                <Flex direction="column" gap={3}>
                    <Text>
                        {createUrl
                            ? i18n('context_add-description-external', {
                                  serviceName: external?.externalServiceName || 'external',
                              })
                            : i18n('context_add-description')}
                    </Text>
                    <Flex gap={2}>
                        {descriptionType === 'yt' && (
                            <Button view="outlined" onClick={edit}>
                                {i18n('action_add-description')}
                            </Button>
                        )}
                        {createUrl && (
                            <Button view="outlined" href={createUrl} target="_blank">
                                {i18n('action_open-external', {
                                    serviceName: external?.externalServiceName || 'external',
                                })}
                                <Icon data={ArrowUpRightFromSquare} size={14} />
                            </Button>
                        )}
                    </Flex>
                </Flex>
            }
        />
    );
}
