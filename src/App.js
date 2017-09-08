import React, { Component } from 'react';
import './App.css';

import IconButton from 'material-ui/IconButton';
import Cross from 'material-ui/svg-icons/content/clear';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';

import md5 from 'md5';

class Block {
    index = null;
    prevHash = null;
    data = null;
    hash = null;
    timestamp = null;

    constructor(index, timestamp, data, prevHash) {
        this.index = index;
        this.prevHash = prevHash;
        this.data = data;
        this.timestamp = timestamp;
        this.hash = this.getHash();
    }

    getHash() {
        return md5(`${this.index}${this.prevHash}${JSON.stringify(this.data)}${this.timestamp}`);
    }
}

class BlockChain {
    chain = [];
    lastBlock = null;

    constructor() {
        this.lastBlock = this.createGenesisBlock();
        this.chain.push(this.lastBlock);
    }

    createGenesisBlock() {
        return new Block(0, Date.now(), {}, {}, '0');
    }

    nextBlock(lastBlock, data) {
        const index = lastBlock.index + 1;
        const timestamp = Date.now();
        const hash = lastBlock.hash;

        return new Block(index, timestamp, data, hash)
    }

    addBlock(data) {
        this.lastBlock = this.nextBlock(this.lastBlock, data);
        this.chain.push(this.lastBlock);

        console.log('Add block:', this.lastBlock.index, `${this.lastBlock.action.type} to (${this.lastBlock.action.place})`, this.lastBlock.hash,);
    }

    isValidNewBlock(newBlock, previousBlock) {
        if (previousBlock.index + 1 !== newBlock.index) {
            console.log('Invalid index');
            return false;
        } else if (previousBlock.hash !== newBlock.previousHash) {
            console.log('Invalid previoushash');
            return false;
        } else if (newBlock.getHash() !== newBlock.hash) {
            console.log('Invalid hash: ' + newBlock.getHash() + ' ' + newBlock.hash);
            return false;
        }

        return true;
    };
}

window.chain = new BlockChain();

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
        display: 'flex',
        height: '100vh',
    },
    field: {
        margin: 'auto',
        width: 360,
        height: 360,
        border: '1px solid'
    }
};

const MAX_STEPS = 9;

class App extends Component {
    state = {
        tiles: [
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
        ],
        type: TYPES.cross,
        step: 0,
    };

    render() {
        return (
            <div style={styles.app}>
                <div style={styles.field}>
                    {this.state.tiles.map(({ type }, i) => (
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
        if (this.state.step > MAX_STEPS || this.state.tiles[i].type) return;

        const tiles = this.state.tiles.slice(0);
        tiles[i].type = this.state.type;

        window.chain.addBlock(this.state, {
            type: 'place',
            place: i,
        });

        this.setState({
            tiles,
            type: this.state.type === TYPES.circle ? TYPES.cross : TYPES.circle,
            step: this.state.step + 1,
        });
    }
}

export default App;
