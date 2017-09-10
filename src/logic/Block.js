import md5 from 'md5';

export default class Block {
    /**
     * @type {number}
     */
    index = 0;

    /**
     * @type {{gameId: string, tileIndex: number, type: string}}
     */
    action = {};

    /**
     * @type {string}
     */
    hash = '';

    /**
     * @type {string}
     */
    previousHash = '';

    /**
     * @type {number}
     */
    timestamp = 0;

    /**
     * @param {number} index
     * @param {{gameId: string, tileIndex: number, type: boolean}} action
     * @param {string} previousHash
     * @param {number} timestamp
     */
    constructor(index, action, previousHash, timestamp = Date.now() / 1000) {
        this.index = index;
        this.previousHash = previousHash;
        this.action = action;
        this.timestamp = timestamp;
        this.hash = this.getHash();
    }

    /**
     * @returns {string}
     */
    getHash() {
        return md5(`${this.index}${this.previousHash}${JSON.stringify(this.action)}${this.timestamp}`);
    }

    clone() {
        return new Block(this.index, this.action, this.previousHash, this.timestamp);
    }
}
