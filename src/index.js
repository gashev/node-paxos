const app = require('./app');
const ip = process.env.IP || 'localhost';
const port = process.env.PORT || 50000;
const servers = getServers();

function getServers() {
    const serversStr = process.env.SERVERS;
    var allServers = serversStr.split(',');
    var index = allServers.indexOf(`${ip}:${port}`);
    if (index === -1) {
        throw Error('Current server not found in SERVERS list.');
    }

    allServers.splice(index, 1);
    return allServers;
}

let proposalNumber = 0;
let currentNumber = 0;
let value = undefined;

const actions = {
    'set': 'setAction',
    'prepare': 'prepareAction'
};



app.initApp(ip, port);
