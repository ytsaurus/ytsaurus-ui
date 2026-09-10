import {connect} from 'react-redux';

import {toggleFullScreen} from '../../../../../../store/actions/navigation/content/table/table';

import {FullScreenButtonBase} from './FullScreenButtonBase';

const mapStateToProps = (state) => {
    const {isFullScreen} = state.navigation.content.table;

    return {isFullScreen};
};

const mapDispatchToProps = {
    toggleFullScreen,
};

export const FullScreenButton = connect(mapStateToProps, mapDispatchToProps)(FullScreenButtonBase);
