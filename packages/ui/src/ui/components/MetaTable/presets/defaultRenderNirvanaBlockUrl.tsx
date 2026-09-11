import React from 'react';
import {type MetaTableNirvanaBlockUrlRenderer} from '@ytsaurus/components';
import {Markdown} from '../../Markdown/Markdown';

export const renderDefaultNirvanaBlockUrl: MetaTableNirvanaBlockUrlRenderer = ({text}) => {
    return <Markdown text={text} errorMode="inline" />;
};
