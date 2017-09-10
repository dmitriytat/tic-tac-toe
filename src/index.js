import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
// import registerServiceWorker from './registerServiceWorker';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

ReactDOM.render(<MuiThemeProvider><App gameId="1" /></MuiThemeProvider>, document.getElementById('root'));
ReactDOM.render(<MuiThemeProvider><App gameId="1" /></MuiThemeProvider>, document.getElementById('root1'));
ReactDOM.render(<MuiThemeProvider><App gameId="2" /></MuiThemeProvider>, document.getElementById('root2'));
ReactDOM.render(<MuiThemeProvider><App gameId="2" /></MuiThemeProvider>, document.getElementById('root3'));

// registerServiceWorker();
