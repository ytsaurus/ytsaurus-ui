import React from 'react';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';

import Button from '../../components/Button/Button';
import IconImpl, {type IconProps} from '../../components/Icon/Icon';
import i18n from './i18n';

const block = cn('elements-message');

// Preserve the legacy ignored prop rather than changing the rendered icon during migration.
const Icon: React.ComponentType<IconProps & {type?: string}> = IconImpl;

export type MessageProps = {
    theme?: string;
    showClose?: boolean;
    dismissCallback?: React.MouseEventHandler<HTMLButtonElement>;
    content: React.ReactNode;
    buttons?: Array<{text: string; callback: React.MouseEventHandler<HTMLButtonElement>}>;
};

export default function Message({
    theme = 'default',
    showClose = false,
    dismissCallback,
    content,
    buttons,
}: MessageProps) {
    return (
        <div className={block({theme})}>
            {showClose && (
                <div className={block('close')}>
                    <Button
                        size="m"
                        view="flat-secondary"
                        title={i18n('action_close')}
                        onClick={dismissCallback}
                    >
                        <Icon type="close" />
                    </Button>
                </div>
            )}

            {React.isValidElement(content)
                ? // Preserve the existing object-shaped child; fixing it is a separate behavior change.
                  ({content} as {content: React.ReactNode} & React.ReactElement)
                : map_(content as readonly React.ReactNode[], (data, index) => (
                      <p key={index} className={block('paragraph')}>
                          {data}
                      </p>
                  ))}

            {buttons && (
                <div className={block('buttons')}>
                    {map_(buttons, (button) => (
                        <span className={block('button')} key={button.text}>
                            <Button size="m" title={button.text} onClick={button.callback}>
                                {button.text}
                            </Button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
