const express = require('express');
const ExpressPeerServer = require('peer').ExpressPeerServer;
import bodyParser  from 'body-parser';

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


const app = express();
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());

app.use('/', express.static('build'));

const server = app.listen(8080, '0.0.0.0', () => {
    console.log('listen');
});

const bus = new Bus();

app.post('/connect', (req, res) => {
    const clients = bus.getClients().filter(id => id !== req.body.id);
    res.send(clients);
});

const peerServer = ExpressPeerServer(server, { debug: true });
app.use('/peerjs', peerServer);

peerServer.on('connection', function(id) {
    console.log('connection', id);
    bus.addClients([id]);
});

peerServer.on('disconnect', function(id) {
    console.log('disconnect', id);
    bus.removeClients([id]);
});
