import React from 'react';
import {useSelector} from '../../store/redux-hooks';
import {getFontFamilies} from '../../store/selectors/global/fonts';
import {waitForFontFamily} from '../../store/actions/global/fonts';

export function WaitForFont({children}: {children: React.ReactNode}) {
    const {regular, monospace} = useSelector(getFontFamilies);
    const [ready, setReady] = React.useState(false);
    React.useEffect(() => {
        Promise.all([waitForFontFamily(regular), waitForFontFamily(monospace)]).then(() =>
            setReady(true),
        );
    }, [regular, monospace]);

    return ready ? children : null;
}
