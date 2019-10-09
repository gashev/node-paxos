const express = require('express');

const setAction = require('../src/actions/set');
const prepareAction = require('../src/actions/prepare');

exports.initApp = function(ip, port, servers) {
    const app = express();
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
            case 'prepare':
                prepareAction.prepareAction(req.body, servers);
                break;
            case 'set':
                setAction.setAction(req.body, servers);
                break;
            default:
                res.send('{"error": "Incorrect action"}');
                return;
        }
        res.send("Ok");
    });

    app.listen(port, ip, () => console.log(`Example app listening on port ${port}!`));
}