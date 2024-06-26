import React, {Component} from 'react';
import {connect} from 'react-redux';
import cn from 'bem-cn-lite';
import {partition} from 'lodash';

import {ClickableText} from '../../../../../../components/ClickableText/ClickableText';
import {getMediumList} from '../../../../../../store/selectors/thor';

import hammer from '../../../../../../common/hammer';
import {RootState} from '../../../../../../store/reducers';
import AccountQuota from '../../../../AccountQuota/AccountQuota';
import {AccountResourceName} from '../../../../../../constants/accounts/accounts';
import AccountTransferQuotaMessage from '../AccountTransferQuotaMessage';

const block = cn('accounts-medium-content-tab');

interface Props {
    account: {
        name: string;
        perMedium: {
            [type: string]: {
                totalDiskSpace: number;
                diskSpaceLimit: number;
                committedDiskSpace: number;
                uncommittedDiskSpace: number;
                diskSpaceProgress: number;
                diskSpaceProgressText: string;
                diskSpaceProgressTheme: string;
            };
        };
    };
    mediumList: Array<string>;
}

class MediumContent extends Component<Props> {
    state = {
        showAllMediums: false,
    };

    toggleShowAll = () => {
        this.setState({showAllMediums: !this.state.showAllMediums});
    };

    renderMediums(account: Props['account'], mediums: Array<string>) {
        return mediums.map((mediumType) => (
            <AccountQuota
                key={mediumType}
                title={hammer.format['ReadableField'](mediumType) + ' medium'}
                currentAccount={account.name}
                type={AccountResourceName.DISK_SPACE_PER_MEDIUM}
                mediumType={mediumType}
            />
        ));
    }

    render() {
        const {account, mediumList} = this.props;
        const mediumTypesWithoutCache = mediumList.filter((item) => item !== 'cache');
        const [defined, rest] = partition(
            mediumTypesWithoutCache,
            (mediumType) => account.perMedium[mediumType],
        );

        const {showAllMediums} = this.state;
        let showAllText = '';
        if (rest.length > 0) {
            showAllText = showAllMediums ? 'Show defined only' : 'Show all';
        }
        return (
            <div className={block()}>
                <AccountTransferQuotaMessage />
                {this.renderMediums(account, defined)}
                {showAllText && (
                    <div className={block('show-all', 'elements-section')}>
                        <ClickableText onClick={this.toggleShowAll}>{showAllText}</ClickableText>
                    </div>
                )}
                {showAllMediums && this.renderMediums(account, rest)}
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    mediumList: getMediumList(state),
});

export default connect(mapStateToProps)(MediumContent);
