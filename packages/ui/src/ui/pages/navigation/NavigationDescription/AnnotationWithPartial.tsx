import React, {FC} from 'react';
import {useSelector} from 'react-redux';
import {Button, Flex, Link, Text} from '@gravity-ui/uikit';
import {NotFound} from '@gravity-ui/illustrations';

import {getDescriptionType} from '../../../store/reducers/navigation/description';

import {Markdown} from '../../../components/Markdown/Markdown';
import {ClickableText} from '../../../components/ClickableText/ClickableText';
import Icon from '../../../components/Icon/Icon';

import UIFactory from '../../../UIFactory';

import {useExternalAnnotation} from './hooks/use-external-annotation';

type Props = {
    annotation?: string;
    expanded: boolean;
    onToggle: () => void;
};

export const AnnotationWithPartial: FC<Props> = ({annotation, expanded, onToggle}) => {
    const value = annotation || '';

    const descriptionType = useSelector(getDescriptionType);

    const {externalAnnotationLink} = useExternalAnnotation();

    const {isFullText, text} = React.useMemo(() => {
        const rows = value.split(/\n+/);
        return {
            text: rows.slice(0, 3).join('\n\n'),
            isFullText: rows.length <= 3,
        };
    }, [value]);

    if (!value.length && descriptionType === 'external') {
        return <ExternalAnnotationFallback externalAnnotationLink={externalAnnotationLink} />;
    }

    return (
        <>
            <Markdown text={expanded ? value : text} />
            {isFullText ? null : (
                <ClickableText color={'secondary'} onClick={onToggle}>
                    {expanded ? 'Hide more' : 'Show more'}
                </ClickableText>
            )}
        </>
    );
};

function ExternalAnnotationFallback({externalAnnotationLink}: {externalAnnotationLink?: string}) {
    return (
        <Flex direction={'row'} gap={5} width={'max'} justifyContent={'center'}>
            <NotFound height={85} width={85} />
            <Flex direction={'column'} gap={3}>
                <Text variant={'subheader-2'}>
                    No {UIFactory?.externalAnnotationSetup?.externalServiceName || 'external'}{' '}
                    description found
                </Text>
                <Link href={externalAnnotationLink || ''} target={'_blank'}>
                    <Button view={'action'} size={'l'} disabled={!externalAnnotationLink}>
                        <Text>
                            Create with{' '}
                            {UIFactory?.externalAnnotationSetup?.externalServiceName ||
                                'external service'}
                        </Text>
                        <Icon awesome={'external-link'} size={16} />
                    </Button>
                </Link>
            </Flex>
        </Flex>
    );
}
