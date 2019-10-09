const request = require('request');
const state = require('../src/state');

exports.Actions = class Actions {
    constructor(servers) {
        this.servers = servers;
        this.state = new state.State();
        this.quorumCount = Math.floor(this.servers.length / 2) + 1;
    }

    sendRequest(options) {
        return new Promise(function(resolve, reject) {
            request(options, function(err, resp, body) {
                if (err) {
                reject(err);
                } else {
                resolve(body);
                }
            })
        })
    }

    async setAction(body, servers) {
        const value = body.value;
        const proposalNumber = new Date().getTime();
        let result = {};
        let counter = 0;

        /* Prepare request. */
        for (let i = 0; i < servers.length; i++) {
            const options = {
                url: 'http://' + servers[i],
                body: JSON.stringify({
                    action: 'prepare',
                    number: proposalNumber
                }),
                method: 'POST',
                headers: {
                    'Content-Type':'application/json'
                }
            };

            result[servers[i]] = JSON.parse(await this.sendRequest(options));

            console.log(servers[i], result[servers[i]], result[servers[i]].status);
            if (result[servers[i]].status === 'Ok') {
                counter++;
            } else if (result[servers[i]].number !== undefined) {
                return {value: result[servers[i]].value}
            }
        }

        console.log('counter', counter);
        console.log('this.quorumCount', this.quorumCount);
        if (counter < this.quorumCount) {
            return {error: 'No quorum'}
        }

        /* Accept request. */
        result = {};
        for (let i = 0; i < servers.length; i++) {
            const options = {
                url: 'http://' + servers[i],
                body: JSON.stringify({
                    action: 'accept',
                    number: proposalNumber,
                    value: value,
                }),
                method: 'POST',
                headers: {
                    'Content-Type':'application/json'
                }
            };

            result[servers[i]] = JSON.parse(await this.sendRequest(options));
        }
        console.log(result);
    }

    prepareAction(body, servers) {
        if (this.state.currentNumber > body.number) {
            return {number: body.number, value: this.state.value};
        }

        this.state.currentNumber = body.number;
        return {status: 'Ok'};
    }

    acceptAction(body, servers) {
        if (this.state.currentNumber > body.number) {
            return {number: body.number, value: this.state.value};
        }

        this.state.currentNumber = body.number;
        this.state.value = body.value;

        console.log('this.state', this.state);
        return {number: body.number, value: this.state.value};
    }
}