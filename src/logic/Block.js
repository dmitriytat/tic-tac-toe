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
    prevHash = '';

    /**
     * @type {number}
     */
    timestamp = 0;

    /**
     * @param {number} index
     * @param {{gameId: string, tileIndex: number, type: string}} action
     * @param {string} prevHash
     * @param {number} timestamp
     */
    constructor(index, action, prevHash, timestamp = Date.now() / 1000) {
        this.index = index;
        this.prevHash = prevHash;
        this.action = action;
        this.timestamp = timestamp;
        this.hash = this.getHash();
    }

    /**
     * @returns {string}
     */
    getHash() {
        return md5(`${this.index}${this.prevHash}${JSON.stringify(this.action)}${this.timestamp}`);
    }

    clone() {
        return new Block(this.index, this.action, this.prevHash, this.timestamp);
    }
}
