import React from 'react';

import {useCreationOptions} from '../useCreationOptions';

export function CreationOptionsTestComponent({context}: {context: 'cluster' | 'admin'}) {
    const [original, setOriginal] = React.useState(true);
    const {load, loading, options} = useCreationOptions(
        context === 'cluster' && !original ? 'other' : 'original',
        context === 'admin' ? original : true,
    );

    let status = 'Idle';
    if (loading) {
        status = 'Loading';
    } else if (options) {
        status = 'Ready';
    }

    return (
        <div>
            <button onClick={load}>Load</button>
            <button onClick={() => setOriginal(!original)}>Switch context</button>
            <output>{status}</output>
        </div>
    );
}
