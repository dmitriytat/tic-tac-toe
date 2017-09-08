import React, {Component} from 'react';
import './App.css';

import IconButton from 'material-ui/IconButton';
import Cross from 'material-ui/svg-icons/content/clear';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import md5 from "md5";

const TYPES = {
    cross: 'cross',
    circle: 'circle',
};

const styles = {
    largeIcon: {
        width: 60,
        height: 60,
    },
    large: {
        width: 120,
        height: 120,
        padding: 30,
    },
    app: {
        display: 'inline-block',
    },
    field: {
        margin: 'auto',
        width: 360,
        height: 360,
        border: '1px solid'
    }
};

class App extends Component {
    state = {
        tiles: ['','','','','','','','','',],
        type: TYPES.cross,
        step: 0,
    };

    constructor(props) {
        super(props);

        this.state.gameId = props.gameId;
    }

    componentDidMount() {
        this.chain = this.props.bus.createChain((state) => {
            const tiles = this.state.tiles.map((tile, i) => {
                return state[this.state.gameId] && state[this.state.gameId][i] || tile;
            });

            console.log(this.state.gameId)

            this.setState({
                tiles,
                type: this.state.type === TYPES.cross ? TYPES.circle : TYPES.cross,
            });
        });
    }

    render() {
        return (
            <div style={styles.app}>
                <h5>{this.state.gameId}</h5>
                <div style={styles.field}>
                    {this.state.tiles.map((type, i) => (
                        <IconButton
                            iconStyle={styles.largeIcon}
                            style={styles.large}
                            onClick={() => this.handleTileClick(i)}
                        >
                            {type === TYPES.cross && <Cross/>}
                            {type === TYPES.circle && <Circle/>}
                        </IconButton>
                    ))}
                </div>
            </div>
        );
    }

    handleTileClick = (i) => {
        this.chain.addBlock({
            gameId: this.state.gameId,
            tileIndex: i,
            type: this.state.type
        });
    }
}

export default App;
