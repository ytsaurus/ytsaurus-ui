/* global YT */
import React from 'react';
import cn from 'bem-cn-lite';

import FilterOverview from '../../../pages/operations/OperationDetail/tabs/details/FilterOverview/FilterOverview';
import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';
import Label from '../../../components/Label/Label';
import Link from '../../../components/Link/Link';
import Icon from '../../../components/Icon/Icon';

import {TemplateIntermediate} from '../../../components/MetaTable/templates/OperationTemplate';
import templates from '../../../components/templates/utils';
import {Page} from '../../../constants/index';

import hammer from '../../../common/hammer';
import {paramsToQuery} from '../../../utils';
import OperationIOLink from '../../../pages/operations/OperationIOLink/OperationIOLink';

const block = cn('specification');
const ellipsis = cn('elements-ellipsis');

templates.add('operations/detail/specification/io', {
    name(item) {
        const {path, originalPath, transaction, remote, url: itemUrl} = item;

        const query = paramsToQuery({path, t: transaction});
        const url = remote ? itemUrl : `/${YT.cluster}/${Page.NAVIGATION}?${query}`;

        return item.isFolder ? (
            <div className={block('io-folder', ellipsis())}>
                <Icon awesome="folder-open" />
                &nbsp;
                <OperationIOLink {...item} className={block('io-folder-path')} />
            </div>
        ) : (
            <div className={block('io-name', ellipsis())}>
                <ClipboardButton text={path} view="flat-secondary" size="s" title="Copy path" />
                &nbsp;
                <OperationIOLink {...item} />
                &nbsp;
                {originalPath && (
                    <Link title={path} url={url}>
                        <Icon awesome="folders" />
                    </Link>
                )}
            </div>
        );
    },
    filters(item) {
        if (item.isFolder) {
            return;
        }

        const filters = item.filters;
        const typedFilters = item.typedFilters;

        return filters ? (
            <ul className={cn('elements-list')({type: 'unstyled'})}>
                {filters?.columns && (
                    <FilterOverview type="columns" filters={filters} typedFilters={typedFilters} />
                )}
                {filters?.ranges && (
                    <FilterOverview type="ranges" filters={filters} typedFilters={typedFilters} />
                )}
            </ul>
        ) : (
            hammer.format.NO_VALUE
        );
    },
    live_preview(item) {
        if (item.isFolder) {
            return;
        }

        return item.livePreview.supported ? (
            <TemplateIntermediate {...item.livePreview} cluster={YT.cluster} />
        ) : (
            hammer.format.NO_VALUE
        );
    },
    tags(item) {
        if (item.isFolder) {
            return;
        }

        return item.primary || item.teleport || item.append || item.foreign ? (
            <div className={block('tags')}>
                {item.primary && <Label text="primary" theme="info" />}
                {item.teleport && <Label text="teleport" theme="warning" />}
                {item.append && <Label text="append" theme="warning" />}
                {item.foreign && <Label text="foreign" theme="info" />}
            </div>
        ) : (
            hammer.format.NO_VALUE
        );
    },
});
