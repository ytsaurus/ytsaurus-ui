import React from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';

import Button from '../../components/Button/Button';
import Icon from '../../components/Icon/Icon';

const block = cn('elements-message');

export default function Message({
    theme = 'default',
    showClose = false,
    dismissCallback,
    content,
    buttons,
}) {
    return (
        <div className={block({theme})}>
            {showClose && (
                <div className={block('close')}>
                    <Button size="m" view="flat-secondary" title="Close" onClick={dismissCallback}>
                        <Icon type="close" />
                    </Button>
                </div>
            )}

            {React.isValidElement(content)
                ? {content}
                : map_(content, (data, index) => (
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

Message.propTypes = {
    theme: PropTypes.string,
    showClose: PropTypes.bool,
    dismissCallback: (props, propName, componentName) => {
        if (props.showClose && typeof props[propName] !== 'function') {
            return new Error(
                `You have to provide dismissCallback to ${componentName} when showClose is true`,
            );
        }
    },
    content: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.string)]).isRequired,
    buttons: PropTypes.arrayOf(PropTypes.object),
};
