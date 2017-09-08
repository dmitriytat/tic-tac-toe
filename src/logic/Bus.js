import Chain from "./Chain";

export default class Bus {
    /**
     * @type {Object.<number, Chain>}
     */
    chains = {};
    successCount = 1;
    mainChain = null;

    constructor() {
        this.mainChain = new Chain(() => {});
        this.register(this.mainChain);
    }

    createChain(callback) {
        const chain = this.mainChain.clone(callback);
        this.register(chain);

        return chain;
    }

    /**
     * @param {Chain} chain
     */
    register(chain) {
        this.chains[chain.id] = chain;
        chain.setBus(this);
    }

    /**
     *
     * @param {Chain} from
     * @param {string} type
     * @param {Block} block
     */
    broadcast(from, type, block) {
        return new Promise((resolve, reject) => {
            const successes = Object
                .keys(this.chains)
                .map(key => {
                    const chain = this.chains[key];

                    if (chain.id === from.id) return false;

                    return chain[type](block);
                })
                .filter(Boolean);

            successes.length >= this.successCount ? resolve() : reject();
        });
    }

    /**
     * @param {Chain} from
     * @param {Chain} to
     * @param {Block} block
     */
    send(from, to, block) {
        to.receive(block);
    }
}