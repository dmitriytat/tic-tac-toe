import React, {Component} from 'react';
import './App.css';

import IconButton from 'material-ui/IconButton';
import Cross from 'material-ui/svg-icons/content/clear';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import Chain from "./logic/Chain";
import Bus from "./logic/Bus";

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

const clearTiles = ['', '', '', '', '', '', '', '', '',];

class App extends Component {
    state = {
        tiles: clearTiles.slice(),
        type: TYPES.cross,
        step: 0,
    };

    constructor(props) {
        super(props);

        this.state.gameId = props.gameId;
    }

    componentDidMount() {
        const bus = new Bus();
        this.chain = bus.getBlockchain();

        this.chain.update((chain) => {
            const tiles = clearTiles.slice();
            const myChain = chain.filter(({action}) => action.gameId === this.state.gameId);

            myChain.forEach(({action}) => tiles[action.tileIndex] = action.type);

            console.log(myChain);

            this.setState({
                tiles,
                type: myChain[myChain.length - 1] && myChain[myChain.length - 1].action.type === TYPES.cross ? TYPES.circle : TYPES.cross,
            });
        });

        window.lol = this.chain;
    }

    render() {
        return (
            <div style={styles.app}>
                <h5>{this.state.gameId} - {this.state.type}</h5>
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
