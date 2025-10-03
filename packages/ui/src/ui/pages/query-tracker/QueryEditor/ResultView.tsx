import React, {memo} from 'react';
import {QueryItem} from '../../../types/query-tracker/api';
import {QueryResults} from '../QueryResults';
import {Button, Flex, Icon} from '@gravity-ui/uikit';
import {ShareButton} from '../QueryResults/ShareButton';
import {EditQueryACOModal} from '../QueryACO/EditQueryACOModal/EditQueryACOModal';
import SquareIcon from '@gravity-ui/icons/svgs/square.svg';
import LayoutFooterIcon from '@gravity-ui/icons/svgs/layout-footer.svg';
import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';
import {ResultMode} from './QueryEditor';
import cn from 'bem-cn-lite';
import './ResultView.scss';

const b = cn('yt-qt-result-view');

type Props = {
    query: QueryItem;
    resultViewMode: ResultMode;
    setResultViewMode: (v: ResultMode) => void;
};

export const ResultView = memo<Props>(function ResultView({
    query,
    resultViewMode,
    setResultViewMode,
}) {
    return (
        <QueryResults
            query={query}
            className={b()}
            minimized={resultViewMode === 'minimized'}
            toolbar={
                <>
                    <Flex gap={2} className={b('results-toolbar-buttons')}>
                        <ShareButton />
                        <EditQueryACOModal query_id={query.id} />
                    </Flex>
                    {resultViewMode === 'split' ? (
                        <Button view="flat" onClick={() => setResultViewMode('full')}>
                            <Icon data={SquareIcon} size={16} />
                        </Button>
                    ) : (
                        <Button view="flat" onClick={() => setResultViewMode('split')}>
                            <Icon data={LayoutFooterIcon} size={16} />
                        </Button>
                    )}
                    {resultViewMode !== 'minimized' && (
                        <Button view="flat" onClick={() => setResultViewMode('minimized')}>
                            <Icon data={XmarkIcon} size={16} />
                        </Button>
                    )}
                </>
            }
        />
    );
});
