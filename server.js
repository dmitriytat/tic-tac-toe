const express = require('express');
const ExpressPeerServer = require('peer').ExpressPeerServer;
import bodyParser  from 'body-parser';

const app = express();
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());

app.use('/', express.static('build'));

const server = app.listen(9000, () => {
    console.log('listen');
});

app.use('/peerjs', ExpressPeerServer(server, {
    debug: true
}));

class Bus {
    clients = [];

    addClients(clients) {
        this.clients = this.clients.concat(clients);
    }

    getClients() {
        return this.clients;
    }

    removeClients(clients) {
        this.clients = this.clients.filter(client => !clients.includes(client));
    }
}

const bus = new Bus();

app.post('/connect', (req, res) => {
    const clients = bus.getClients();
    bus.addClients([req.body.id]);
    res.send(clients);
});

server.on('connection', function (socket) {
    // console.log('connection', socket)
});

server.on('disconnect', function (id) {
    bus.removeClients([id]);
});