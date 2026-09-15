import React from 'react';
import {type MetaTableNirvanaBlockUrlRenderer} from '@ytsaurus/components';
import {Markdown} from '../../Markdown/Markdown';

export const renderDefaultNirvanaBlockUrl: MetaTableNirvanaBlockUrlRenderer = ({url}) => {
    return <Markdown text={url} errorMode="inline" />;
};
