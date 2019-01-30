/* eslint-disable */
import md5 from 'md5';

import axios from 'axios';
import Chain from './Chain';
import Block from './Block';
import 'peerjs';

const QUERY_LATEST = 'QUERY_LATEST';
const QUERY_ALL = 'QUERY_ALL';
const RESPONSE_BLOCKCHAIN = 'RESPONSE_BLOCKCHAIN';

export default class Bus {
    constructor() {
        this.logging = true;
        this.id = '';
        this.peer = null;
        /**
         * @type {{host: string, port: (*), path: string}}
         */
        this.peerOptions = {
            host: window.location.hostname,
            port: 80,
            path: '/peerjs'
        };

        this.connections = [];

        this.id = md5(`${Date.now()}${Math.random()}`);

        this.blockchain = new Chain();
        this.blockchain.setBus(this);

        this.peer = new Peer(this.id, this.peerOptions);

        this.peer.on('connection', (conn) => {
            conn.on('data', (message) => {
                this.connections = this.connections.concat([conn]);
                this.handleMessage(conn, message);
            });

            conn.on('close', () => {
                this.connections = this.connections.filter(connection => connection !== conn);
            });
        });

        axios.post(`//${this.peerOptions.host}:${this.peerOptions.port}/connect`, {id: this.id})
            .then((response) => {
                return response.data;
            })
            .then(peerIds => {
                peerIds.forEach(id => {
                    const conn = this.peer.connect(id);

                    conn.on('open', () => {
                        conn.on('data', (message) => {
                            this.handleMessage(conn, message);
                        });

                        this.connections = this.connections.concat([conn]);
                        conn.send(this.queryChainLengthMsg());
                    });

                    conn.on('close', () => {
                        this.connections = this.connections.filter(connection => connection !== conn);
                    });
                });
            });
    }

    /**
     * @returns {Chain}
     */
    getBlockchain() {
        return this.blockchain;
    }

    onAddBlock() {
        this.broadcast(this.responseLatestMsg());
    }

    /**
     * @param connection
     * @param data
     */
    handleMessage(connection, data) {
        const message = JSON.parse(data);
        this.log('Received message ' + JSON.stringify(message));
        switch (message.type) {
        case QUERY_LATEST:
            connection.send(this.responseLatestMsg());
            break;
        case QUERY_ALL:
            connection.send(this.responseChainMsg());
            break;
        case RESPONSE_BLOCKCHAIN:
            this.handleBlockchainResponse(message);
            break;
        default: return;
        }
    }

    handleBlockchainResponse(message) {
        const receivedBlocks = message.data
            .map(({index, action, previousHash, timestamp}) => new Block(index, action, previousHash, timestamp))
            .sort((b1, b2) => (b1.index - b2.index));

        const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
        const latestBlockHeld = this.blockchain.getLastBlock();

        if (latestBlockReceived.index > latestBlockHeld.index) {
            this.log('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
            if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
                this.log('We can append the received block to our chain');
                this.blockchain.applyBlock(latestBlockReceived);
                this.broadcast(this.responseLatestMsg());
            } else if (receivedBlocks.length === 1) {
                this.log('We have to query the chain from our peer');
                this.broadcast(this.queryAllMsg());
            } else {
                this.log('Received blockchain is longer than current blockchain');
                this.blockchain.replaceChain(receivedBlocks);
                this.broadcast(this.responseLatestMsg());
            }
        } else {
            this.log('received blockchain is not longer than current blockchain. Do nothing');
        }
    }

    queryChainLengthMsg() {
        this.log(QUERY_LATEST);
        return JSON.stringify({
            'type': QUERY_LATEST
        });
    }

    queryAllMsg() {
        this.log(QUERY_ALL);
        return JSON.stringify({
            'type': QUERY_ALL
        });
    }

    responseChainMsg() {
        this.log('responseChainMsg', RESPONSE_BLOCKCHAIN);
        return JSON.stringify({
            'type': RESPONSE_BLOCKCHAIN,
            'data': this.blockchain.getChain(),
        });
    }

    responseLatestMsg() {
        this.log('responseLatestMsg', RESPONSE_BLOCKCHAIN);
        return JSON.stringify({
            'type': RESPONSE_BLOCKCHAIN,
            'data': [this.blockchain.getLastBlock()],
        });
    }

    /**
     * @param message
     */
    broadcast(message) {
        this.connections
            .forEach(conn => {
                conn.send(message);
            });
    }

    log(...params) {
        if (this.logging) {
            console.log(...params);
        }
    }
}
