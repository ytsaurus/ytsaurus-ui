import {NotFound} from '@gravity-ui/illustrations';
import {Button, Flex, Text} from '@gravity-ui/uikit';
import React, {type FC} from 'react';
import {ClickableText} from '../../../components/ClickableText/ClickableText';
import Icon from '../../../components/Icon/Icon';
import {Markdown} from '../../../components/Markdown/Markdown';
import {getDescriptionType} from '../../../store/reducers/navigation/description';
import {useSelector} from '../../../store/redux-hooks';
import {selectCluster} from '../../../store/selectors/global';
import {selectPath} from '../../../store/selectors/navigation';
import UIFactory from '../../../UIFactory';
import i18n from './i18n';

type Props = {
    annotation?: string;
    expanded: boolean;
    onToggle: () => void;
};

export const AnnotationWithPartial: FC<Props> = ({annotation, expanded, onToggle}) => {
    const value = annotation || '';

    const descriptionType = useSelector(getDescriptionType);

    const {isFullText, text} = React.useMemo(() => {
        const rows = value.split(/\n+/);
        return {
            text: rows.slice(0, 3).join('\n\n'),
            isFullText: rows.length <= 3,
        };
    }, [value]);

    if (!value.length && descriptionType === 'external') {
        return <ExternalAnnotationFallback />;
    }

    return (
        <>
            <Markdown text={expanded ? value : text} />
            {isFullText ? null : (
                <ClickableText color={'secondary'} onClick={onToggle}>
                    {expanded ? i18n('action_hide-more') : i18n('action_show-more')}
                </ClickableText>
            )}
        </>
    );
};

function ExternalAnnotationFallback() {
    const cluster = useSelector(selectCluster);
    const path = useSelector(selectPath);

    const createUrl = UIFactory?.externalAnnotationSetup?.makeCreateUrl?.({cluster, path});
    return (
        <Flex direction={'row'} gap={5} width={'max'} justifyContent={'center'}>
            <NotFound height={85} width={85} />
            <Flex direction={'column'} gap={3}>
                <Text variant={'subheader-2'}>
                    {i18n('alert_no-description-found', {
                        serviceName:
                            UIFactory?.externalAnnotationSetup?.externalServiceName || 'external',
                    })}
                </Text>
                {createUrl ? (
                    <Button view={'action'} size={'l'} href={createUrl} target="_blank">
                        <Text>
                            {i18n('action_create-with', {
                                serviceName:
                                    UIFactory?.externalAnnotationSetup?.externalServiceName ||
                                    'external service',
                            })}
                        </Text>
                        <Icon awesome={'external-link'} size={16} />
                    </Button>
                ) : null}
            </Flex>
        </Flex>
    );
}
