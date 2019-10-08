const express = require('express');
const app = express();
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

function setAction(body) {
    const value = body.value;
    const proposalNumber = new Date().getTime();
    console.log(proposalNumber);
}

app.use(express.json())

app.get('/', function(req, res) {
    res.send(
        JSON.stringify(
            {n: proposalNumber, v: value}
        )
    );
});

app.post('/', function(req, res) {
    switch (req.body.action) {
        case 'set':
            setAction(req.body);
            break;
        default:
            res.send('{"error": "Incorrect action"}');
            return;
    }
    res.send("Ok");
});

app.listen(port, ip, () => console.log(`Example app listening on port ${port}!`));
