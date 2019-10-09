const express = require('express');

const actions = require('../src/actions');

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
        const a = new actions.Actions(servers);
        switch (req.body.action) {
            case 'prepare':
                a.prepareAction(req.body, servers);
                break;
            case 'set':
                a.setAction(req.body, servers);
                break;
            default:
                res.send('{"error": "Incorrect action"}');
                return;
        }
        res.send("Ok");
    });

    app.listen(port, ip, () => console.log(`Example app listening on port ${port}!`));
}