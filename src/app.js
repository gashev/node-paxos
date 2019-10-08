const express = require('express');

const setAction = require('../src/actions/set');

exports.initApp = function(ip, port) {
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
            case 'set':
                setAction.setAction(req.body);
                break;
            default:
                res.send('{"error": "Incorrect action"}');
                return;
        }
        res.send("Ok");
    });

    app.listen(port, ip, () => console.log(`Example app listening on port ${port}!`));
}