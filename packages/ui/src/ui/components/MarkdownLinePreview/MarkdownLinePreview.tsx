import React, {useMemo, useState} from 'react';
import {Text} from '@gravity-ui/uikit';
import Button from '../Button/Button';
import Icon from '../Icon/Icon';
import Modal from '../Modal/Modal';
import cn from 'bem-cn-lite';
import transform from '@doc-tools/transform';

import './MarkdownLinePreview.scss';
import '../Markdown/Markdown.scss';

const block = cn('one-line-text-preview');
const mdBlock = cn('yt-markdown');

interface Props {
    text: string;
    title: string;
    className?: string;
    allowHTML?: boolean;
}

export function MarkdownLinePreview({text, title, className, allowHTML = false}: Props) {
    const [visible, setVisible] = useState(false);

    const showModal = () => {
        setVisible(true);
    };

    const hideModal = () => {
        setVisible(false);
    };

    const {plainText, html} = useMemo(() => {
        const {
            result: {html},
        } = transform(text, {disableLiquid: true, allowHTML});
        const div = document.createElement('div');
        div.innerHTML = html;
        const plainText = div.innerText;
        return {html, plainText};
    }, [text, allowHTML]);

    return (
        <div className={block(null, className)}>
            <Text className={block('preview-text')} color={'primary'} ellipsis>
                {plainText}
            </Text>

            <Button onClick={showModal} view={'flat-secondary'} size={'m'} width={'auto'}>
                <Icon awesome="window-maximize"></Icon>
            </Button>
            {visible ? (
                <Modal
                    visible={visible}
                    title={title}
                    onOutsideClick={hideModal}
                    onCancel={hideModal}
                    footer={false}
                    content={<div className={mdBlock()} dangerouslySetInnerHTML={{__html: html}} />}
                />
            ) : null}
        </div>
    );
}
