import React from 'react';
import cn from 'bem-cn-lite';

import {ClickableText} from '../../components/ClickableText/ClickableText';

import './FilePicker.scss';

const block = cn('yt-file-picker');

interface Props {
    onChange: (v: FileList | null) => void;
    multiple?: boolean;
    children: React.ReactNode;
}

export default class FilePicker extends React.Component<Props> {
    inputRef = React.createRef<HTMLInputElement>();

    onLinkClick = () => {
        if (!this.inputRef.current) {
            return;
        }

        this.inputRef.current.click();
    };

    onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.onChange(event.target.files);
    };

    render() {
        const {children, multiple} = this.props;
        return (
            <ClickableText onClick={this.onLinkClick}>
                {children}
                <input
                    ref={this.inputRef}
                    className={block('input')}
                    onChange={this.onChange}
                    type={'file'}
                    multiple={multiple}
                />
            </ClickableText>
        );
    }
}
