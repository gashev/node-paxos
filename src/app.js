const express = require('express');

const actions = require('../src/actions');

exports.initApp = function(ip, port, servers) {
    const a = new actions.Actions(servers);
    const app = express();
    app.use(express.json())

    app.get('/', function(req, res) {
        res.send({number: a.state.number, value: a.state.value});
    });

    app.post('/', function(req, res) {
        switch (req.body.action) {
            case 'accept':
            case 'prepare':
            case 'set':
                res.send(a[req.body.action + 'Action'](req.body));
                break;
            default:
                res.send('{"error": "Incorrect action"}');
                break;
        }
    });

    app.listen(port, ip, () => console.log(`Example app listening on port ${port}!`));
}