import Block from "./Block";
import md5 from "md5";

export default class Chain {
    chain = [];
    lastBlock = null;
    id = '';
    bus = null;
    state = {};
    callback = {};

    constructor(callback) {
        this.id = md5(`${Date.now()}${Math.random()}`);
        this.lastBlock = this.createGenesisBlock();
        this.chain.push(this.lastBlock);
        this.callback = callback;
    }

    clone(callback) {
        const chain = new Chain(callback);
        chain.state = {...this.state};
        chain.chain = this.chain.map(block => block.clone());
        chain.lastBlock = chain.chain[chain.chain.length - 1];

        return chain;
    }

    createGenesisBlock() {
        return new Block(0, null, '0');
    }

    nextBlock(lastBlock, data) {
        const index = lastBlock.index + 1;
        const hash = lastBlock.hash;

        return new Block(index, data, hash)
    }

    addBlock(data) {
        const nextBlock = this.nextBlock(this.lastBlock, data);

        this.bus.broadcast(this, 'receive', nextBlock).then(() => {
            this.pushBlock(nextBlock);

            console.log('Add block:', nextBlock.index, nextBlock.hash);
        }).catch(e => console.log(e));
    }

    /**
     * @param {Block} newBlock
     * @returns {boolean}
     */
    isValidNewBlock(newBlock) {
        const game = this.state[newBlock.action.gameId] || {};

        if (game[newBlock.action.tileIndex]) {
            console.log('Invalid action');
            return false;
        } else if (this.lastBlock.index + 1 !== newBlock.index) {
            console.log('Invalid index');
            return false;
        } else if (this.lastBlock.hash !== newBlock.prevHash) {
            console.log('Invalid previoushash');
            return false;
        } else if (newBlock.getHash() !== newBlock.hash) {
            console.log('Invalid hash: ' + newBlock.getHash() + ' ' + newBlock.hash);
            return false;
        }

        return true;
    };

    pushBlock(block) {
        this.lastBlock = block;
        this.chain.push(this.lastBlock);

        const game = this.state[block.action.gameId] || (this.state[block.action.gameId] = {});
        game[block.action.tileIndex] = block.action.type;

        this.callback({...this.state});
    }

    /**
     * @param {Bus} bus
     */
    setBus(bus) {
        this.bus = bus;
    }

    /**
     * @param {Block} block
     */
    receive(block) {
        if (!this.isValidNewBlock(block)) return false;

        this.pushBlock(block);

        console.log('Receive block:', this.lastBlock.index, this.lastBlock.hash);

        return true;
    }
}
