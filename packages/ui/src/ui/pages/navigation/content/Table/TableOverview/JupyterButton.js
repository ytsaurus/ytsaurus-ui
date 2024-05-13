import React from 'react';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';

import Button from '../../../../../components/Button/Button';
import Logo from '../../../../../assets/img/svg/jupyter-logo.svg';

import {getPath} from '../../../../../store/selectors/navigation';
import {getCluster} from '../../../../../store/selectors/global';
import {getNavigationPathAttributesLoadState} from '../../../../../store/selectors/navigation/navigation';
import {LOADING_STATUS} from '../../../../../constants';
import {getJupyterBasePath} from '../../../../../config';

JupyterButton.propTypes = {
    // from parent
    block: PropTypes.func.isRequired,
};

function JupyterButton({block}) {
    const loaded = useSelector(getNavigationPathAttributesLoadState) === LOADING_STATUS.LOADED;
    const cluster = useSelector(getCluster);
    const path = useSelector(getPath);

    const basePath = getJupyterBasePath();
    if (!basePath) {
        return null;
    }

    const url = `${basePath}/redirect/nb_template/yt?cluster=${cluster}&path=${path}`;
    return (
        <div className={block('jupyter')}>
            <Button
                size="m"
                href={url}
                view="action"
                target="_blank"
                title="Open in Jupyter"
                disabled={!loaded}
            >
                <span className={block('jupyter-content')}>
                    <Logo className={block('jupyter-logo')} width={22} height={22} />
                    Jupyter
                </span>
            </Button>
        </div>
    );
}

export default JupyterButton;
