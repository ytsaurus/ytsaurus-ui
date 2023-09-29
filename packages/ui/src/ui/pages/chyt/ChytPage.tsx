import React from 'react';
import {Redirect, Route, Switch} from 'react-router';

import {Page} from '../../../shared/constants/settings';

import {ChytPageList} from './ChytPageList/ChytPageList';

export default function ChytPage() {
    return (
        <div className="elements-main-section">
            <Switch>
                <Route path={`/:cluster/${Page.CHYT}`} component={ChytPageList} />
                <Redirect to={`/:cluster/${Page.CHYT}`} />
            </Switch>
        </div>
    );
}
