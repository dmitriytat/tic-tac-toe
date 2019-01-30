require('@babel/register')({
    presets: ['@babel/env'],
    'plugins': ['@babel/plugin-proposal-class-properties']
});

require('./server');
