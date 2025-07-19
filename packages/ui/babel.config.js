module.exports = {
    presets: [['@babel/preset-env', {targets: {node: 'current'}}], '@babel/preset-typescript', '@babel/preset-react'],
    env: {
        'test:unit': {
            presets: [
                ['@babel/preset-env', {targets: {node: 'current'}}],
                '@babel/preset-typescript',
            ],
        },
    },
};
