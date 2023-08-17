import React from 'react';
import {Popover, Text} from '@gravity-ui/uikit';
import Icon from '../../../../../components/Icon/Icon';
import MetaTable from '../../../../../components/MetaTable/MetaTable';
import {MarkdownLinePreview} from '../../../../../components/MarkdownLinePreview/MarkdownLinePreview';
import cn from 'bem-cn-lite';

import './ExternalDescription.scss';

const block = cn('external-description');

export interface ExternalSchemaDescription {
    name: string;
    type: string;
    glossaryEntity: {
        description: string;
    };
}

interface Props {
    type: string;
    data: ExternalSchemaDescription;
}

export function ExternalDescription({type, data}: Props) {
    const hasWarning = type !== data.type;
    const {description} = data.glossaryEntity;
    const {name: title} = data;
    const hasDescription = Boolean(description) && description !== '';

    const typeMismatchElement = (
        <>
            <Text color={'warning'}>
                <Icon awesome="exclamation-triangle" face="solid" />
                There might be a type mismatch
            </Text>
            <MetaTable
                className={block('meta')}
                items={[
                    {
                        key: 'type',
                        value: type,
                    },
                    {
                        key: 'external type',
                        value: data.type,
                    },
                ]}
            />
        </>
    );
    return (
        <div className={block()}>
            {hasWarning ? (
                <Popover
                    className={block('warning')}
                    content={typeMismatchElement}
                    placement={'left'}
                    disabled={!hasWarning}
                >
                    <Icon className={block('icon')} awesome="exclamation-triangle" face="solid" />
                </Popover>
            ) : null}
            {hasDescription ? (
                <MarkdownLinePreview
                    className={block('preview')}
                    text={description}
                    title={title}
                    allowHTML={true}
                />
            ) : (
                <Text className={block('preview')} color={'hint'} ellipsis>
                    {'no description'}
                </Text>
            )}
        </div>
    );
}
