import React, {FC} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import ThumbsUpIcon from '@gravity-ui/icons/svgs/thumbs-up.svg';
import ThumbsDownIcon from '@gravity-ui/icons/svgs/thumbs-down.svg';
import ThumbsUpFillIcon from '@gravity-ui/icons/svgs/thumbs-up-fill.svg';
import ThumbsDownFillIcon from '@gravity-ui/icons/svgs/thumbs-down-fill.svg';
import {Reaction} from '../../../../shared/ai-chat';

type Props = {
    timestamp: number;
    reaction: Reaction;
    onAnswer: (newReaction: Reaction, timestamp: number) => void;
};

export const AnswerReaction: FC<Props> = ({timestamp, reaction, onAnswer}) => {
    const handleLike = () => {
        onAnswer(Reaction.Like, timestamp);
    };

    const handleDislike = () => {
        onAnswer(Reaction.Dislike, timestamp);
    };

    return (
        <>
            <Button view="flat" onClick={handleLike}>
                <Icon
                    data={reaction === Reaction.Like ? ThumbsUpFillIcon : ThumbsUpIcon}
                    size={16}
                />
            </Button>
            <Button view="flat" onClick={handleDislike}>
                <Icon
                    data={reaction === Reaction.Dislike ? ThumbsDownFillIcon : ThumbsDownIcon}
                    size={16}
                />
            </Button>
        </>
    );
};
