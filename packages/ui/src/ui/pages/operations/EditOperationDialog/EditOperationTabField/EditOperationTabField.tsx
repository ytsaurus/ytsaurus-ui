import React from 'react';
import cn from 'bem-cn-lite';

import {Tooltip} from '@gravity-ui/uikit';

import {TabFieldVertical, type TabFieldVerticalProps} from '../../../../containers/Dialog';

import i18n from '../i18n';

import './EditOperationTabField.scss';

const block = cn('yt-edit-operation-tab-field');
const SPECIFICATION_TAB = 'specification';

type Props = TabFieldVerticalProps;

export const EditOperationTabField = Object.assign(
    function EditOperationTabField({className, activeTab, tabItems, ...rest}: Props) {
        const specification = tabItems.find(({name}) => name === SPECIFICATION_TAB);
        const poolTrees = tabItems.filter(({name}) => name !== SPECIFICATION_TAB);

        return (
            <div className={block(null, className)}>
                {poolTrees.length > 0 && (
                    <React.Fragment>
                        <div className={block('pool-trees-title')}>
                            {i18n('section_pool-trees')}
                        </div>
                        <TabFieldVertical
                            className={block('pool-trees', {
                                'with-separator': Boolean(specification),
                            })}
                            {...rest}
                            activeTab={activeTab}
                            tabItems={poolTrees}
                            size="m"
                            wrapTo={(node, item) => (
                                <Tooltip content={item.name}>
                                    <div className={block('pool-tree')}>{node}</div>
                                </Tooltip>
                            )}
                        />
                    </React.Fragment>
                )}
                {specification && (
                    <TabFieldVertical
                        className={block('specification')}
                        {...rest}
                        activeTab={activeTab}
                        tabItems={[specification]}
                        virtualized={false}
                    />
                )}
            </div>
        );
    },
    {
        isTabControl: true as const,
        isTabControlVertical: true,
    },
);

export default EditOperationTabField;
