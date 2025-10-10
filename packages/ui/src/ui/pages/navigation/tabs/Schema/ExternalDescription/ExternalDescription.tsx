import React from 'react';
import {Text} from '@gravity-ui/uikit';
import {Tooltip} from '../../../../../components/Tooltip/Tooltip';
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
        title: string;
    };
}

interface Props {
    type: string;
    data: ExternalSchemaDescription;
    column: keyof ExternalSchemaDescription['glossaryEntity'];
}

export function ExternalDescription({type, data, column}: Props) {
    const hasWarning = type !== data.type;
    const {[column]: markdown} = data.glossaryEntity ?? {};

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
                <Tooltip
                    className={block('warning')}
                    content={typeMismatchElement}
                    placement={'left'}
                    disabled={!hasWarning}
                >
                    <Icon className={block('icon')} awesome="exclamation-triangle" face="solid" />
                </Tooltip>
            ) : null}
            {markdown ? (
                <MarkdownLinePreview
                    className={block('preview')}
                    text={markdown}
                    title={data.name}
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
