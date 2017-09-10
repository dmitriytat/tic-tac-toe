import Block from "./Block";

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

        setTimeout(() => this.restoreChain(), 0)
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

        return new Block(index, data, hash)
    }

    /**
     * @param {Block} block
     */
    pushBlock(block) {
        this.blockchain.push(block);
        this.saveChain();
        this.patchState([block]);
        this.callback(this.state);
    }

    addBlock(data) {
        const nextBlock = this.nextBlock(this.getLastBlock(), data);

        if (!this.isValidNewBlock(nextBlock, this.getLastBlock())) return;

        this.pushBlock(nextBlock);

        this.bus.onAddBlock();
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
        const game = this.state[newBlock.action.gameId] || {};

        if (game.tiles && game.tiles[newBlock.action.tileIndex] !== '') {
            console.log('Invalid action');
            return false;
        } else if (prevBlock.index + 1 !== newBlock.index) {
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
    };

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
    };

    /**
     * @param {Array.<Block>} newBlocks
     */
    replaceChain(newBlocks) {
        if (this.isValidChain(newBlocks) && newBlocks.length > this.blockchain.length) {
            console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
            this.blockchain = newBlocks;

            this.saveChain();
            this.calculateFullState();
            this.callback(this.state);
        } else {
            console.log('Received blockchain invalid');
        }
    }

    saveChain() {
        window.localStorage.setItem('chain', JSON.stringify(this.blockchain));
    }

    restoreChain() {
        const fromStore = window.localStorage.getItem('chain') || "[]";
        const blockchain = JSON.parse(fromStore)
            .map(({index, action, previousHash, timestamp}) => new Block(index, action, previousHash, timestamp));

        if (blockchain.length) {
            this.blockchain = blockchain;
            this.calculateFullState();
            this.callback(this.state);
        }
    }

    calculateFullState() {
        this.state = this.blockchain.reduce((state, {action}) => {
            const tiles = state[action.gameId] && state[action.gameId].tiles || ['','','','','','','','','',];

            tiles[action.tileIndex] = action.type;

            return {
                ...state,
                [action.gameId]: {
                    tiles,
                    type: action.type
                },
            }
        }, {});
    }

    patchState(blocks) {
        this.state = blocks.reduce((state, {action}) => {
            const tiles = state[action.gameId] && state[action.gameId].tiles || ['','','','','','','','','',];

            tiles[action.tileIndex] = action.type;

            return {
                ...state,
                [action.gameId]: {
                    tiles,
                    type: action.type
                },
            }
        }, this.state);
    }
}
