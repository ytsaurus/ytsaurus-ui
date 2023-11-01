import React from 'react';
import cn from 'bem-cn-lite';
import Button from '../../components/Button/Button';

import './TabbedContent.scss';
import {DropdownMenu, DropdownMenuItem} from '@gravity-ui/uikit';

const block = cn('yt-tabbed-content');

interface Props {
    className?: string;
    name: string;
    subTitle?: string;
    actions?: Array<DropdownMenuItem<unknown>>;
    actionAsDropdown?: boolean;
    children: React.ReactElement;
    contentClassName?: string;
}

export default function TabbedContent(props: Props) {
    const {name, subTitle, actions, children, className, contentClassName, actionAsDropdown} =
        props;
    const growTitle = !subTitle;
    return (
        <div className={block(null, className)}>
            <div className={block('header')}>
                <span className={block('title', {growable: growTitle})} title={name}>
                    {name}
                </span>
                {subTitle && (
                    <React.Fragment>
                        <span className={block('sub-title')} title={subTitle}>
                            {subTitle}
                        </span>
                    </React.Fragment>
                )}
                {actions && <Actions actions={actions} useDropdown={Boolean(actionAsDropdown)} />}
            </div>
            <div className={block('content', contentClassName)}>{children}</div>
        </div>
    );
}

function Actions(props: {actions: Required<Props>['actions']; useDropdown: boolean}) {
    const {actions, useDropdown} = props;

    return !actions.length ? null : (
        <span className={block('actions')}>
            {useDropdown ? (
                <DropdownMenu items={actions} />
            ) : (
                actions.map(({text, icon, action}, index) => {
                    return (
                        <Button
                            key={index}
                            onClick={action}
                            size={'m'}
                            className={block('actions-item')}
                        >
                            {icon}
                            {text}
                        </Button>
                    );
                })
            )}
        </span>
    );
}
