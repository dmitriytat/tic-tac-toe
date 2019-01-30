/* eslint-disable */
import Block from './Block';

const DEFAULT_TILES = ['','','','','','','','','',];

export default class Chain {
    /**
     * @type {Array.<Block>}
     */
    blockchain = [];
    callback = () => {};
    bus = null;
    state = {};

    constructor() {
        this.blockchain.push(this.createGenesisBlock());

        setTimeout(() => this.restoreChain(), 0);
    }

    setBus(bus) {
        this.bus = bus;
    }

    update(callback) {
        this.callback = callback;
    }

    /**
     * @returns {Array.<Block>}
     */
    getChain() {
        return this.blockchain;
    }

    /**
     * @returns {Block}
     */
    getLastBlock() {
        return this.blockchain[this.blockchain.length - 1];
    }

    createGenesisBlock() {
        return new Block(0, {}, '0', 0);
    }

    nextBlock(lastBlock, data) {
        const index = lastBlock.index + 1;
        const hash = lastBlock.hash;

        return new Block(index, data, hash);
    }

    /**
     * @param {Block} block
     */
    pushBlock(block) {
        try {
            this.state = this.calculateState([block], this.state);
            this.blockchain.push(block);
            this.saveChain();
            this.bus.onAddBlock();
            this.callback(this.state);
        } catch (e) {
            console.warn(e.message);
        }
    }

    addBlock(data) {
        const nextBlock = this.nextBlock(this.getLastBlock(), data);

        if (!this.isValidNewBlock(nextBlock, this.getLastBlock())) return false;

        this.pushBlock(nextBlock);
    }

    /**
     * @param {Block} block
     */
    applyBlock(block) {
        if (!this.isValidNewBlock(block, this.getLastBlock())) return;

        this.pushBlock(block);

        console.log('Receive block:', block.index, block.hash);
    }

    /**
     * @param {Block} newBlock
     * @param {Block} prevBlock
     * @returns {boolean}
     */
    isValidNewBlock(newBlock, prevBlock) {
        if (prevBlock.index + 1 !== newBlock.index) {
            console.log('Invalid index');
            return false;
        } else if (prevBlock.hash !== newBlock.previousHash) {
            console.log('Invalid previoushash');
            return false;
        } else if (newBlock.getHash() !== newBlock.hash) {
            console.log('Invalid hash: ' + newBlock.getHash() + ' ' + newBlock.hash);
            return false;
        }

        return true;
    }

    /**
     * @param {Array.<Block>} blockchainToValidate
     */
    isValidChain(blockchainToValidate) {
        if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(this.createGenesisBlock())) {
            return false;
        }
        const tempBlocks = [blockchainToValidate[0]];
        for (let i = 1; i < blockchainToValidate.length; i++) {
            if (this.isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
                tempBlocks.push(blockchainToValidate[i]);
            } else {
                return false;
            }
        }
        return true;
    }

    /**
     * @param {Array.<Block>} newBlocks
     */
    replaceChain(newBlocks) {
        if (this.isValidChain(newBlocks) && newBlocks.length > this.blockchain.length) {
            console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');

            try {
                this.state = this.calculateState(newBlocks);
                this.blockchain = newBlocks;
                this.callback(this.state);
                this.saveChain();
            } catch (e) {
                console.warn(e.message);
            }
        } else {
            console.log('Received blockchain invalid');
        }
    }

    saveChain() {
        window.localStorage.setItem('chain', JSON.stringify(this.blockchain));
    }

    restoreChain() {
        const fromStore = window.localStorage.getItem('chain') || '[]';
        const blockchain = JSON.parse(fromStore)
            .map(({index, action, previousHash, timestamp}) => new Block(index, action, previousHash, timestamp));

        if (blockchain.length) {
            try {
                this.state = this.calculateState(blockchain);
                this.blockchain = blockchain;
                this.callback(this.state);
            } catch (e) {
                console.warn(e.message);
            }
        }
    }

    /**
     * @param {Array.<Block>} blocks
     * @param {{}} oldState
     * @returns {{}}
     */
    calculateState(blocks, oldState = {}) {
        return blocks.reduce((state, {action}) => {
            const tiles = state[action.gameId] && state[action.gameId].tiles || DEFAULT_TILES.slice();

            if (action.tileIndex === undefined) return state;

            if (tiles[action.tileIndex] !== '') throw new Error('Invalid action');

            tiles[action.tileIndex] = action.type;

            return {
                ...state,
                [action.gameId]: {
                    tiles,
                    type: action.type
                },
            };
        }, oldState);
    }
}
