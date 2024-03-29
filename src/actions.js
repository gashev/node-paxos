const request = require('request');
const state = require('../src/state');

exports.Actions = class Actions {
    constructor(servers) {
        this.servers = servers;
        this.state = new state.State();
        this.quorumCount = Math.floor(this.servers.length / 2) + 1;
    }

    async _sendRequest(options) {
        try {
            let result = await new Promise(function(resolve, reject) {
                request(options, function(err, resp, body) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(body);
                    }
                })
            });
            return JSON.parse(result);
        } catch (err) {
            return {error: err};
        }
    }

    async _acceptRequest(number, value) {
        let result = {};
        for (let i = 0; i < this.servers.length; i++) {
            const options = {
                url: 'http://' + this.servers[i],
                body: JSON.stringify({
                    action: 'accept',
                    number: number,
                    value: value,
                }),
                method: 'POST',
                headers: {
                    'Content-Type':'application/json'
                }
            };

            result[this.servers[i]] = await this._sendRequest(options);
            /* @todo: add response validation (number parameter). */
        }

        return result;
    }

    async setAction(body) {
        console.log('action request');
        const value = body.value;
        const proposalNumber = new Date().getTime();
        let result = {};
        let counter = 0;

        /* Prepare request. */
        for (let i = 0; i < this.servers.length; i++) {
            const options = {
                url: 'http://' + this.servers[i],
                body: JSON.stringify({
                    action: 'prepare',
                    number: proposalNumber
                }),
                method: 'POST',
                headers: {
                    'Content-Type':'application/json'
                }
            };

            result[this.servers[i]] = await this._sendRequest(options);

            console.log(this.servers[i], result[this.servers[i]], result[this.servers[i]].status);

            if (result[this.servers[i]].status === 'Ok') {
                counter++;
            } else if (result[this.servers[i]].number !== undefined) {
                return {value: result[this.servers[i]].value}
            }
        }

        console.log('counter', counter);
        console.log('this.quorumCount', this.quorumCount);
        if (counter < this.quorumCount) {
            return {error: 'No quorum'}
        }

        result = await this._acceptRequest(proposalNumber, value);
        console.log(result);
    }

    prepareAction(body) {
        console.log('prepare request');

        if (this.state.prepareNumber >= body.number) {
            return {number: this.state.prepareNumber};
        }

        if (this.state.number >= body.number) {
            return {number: this.state.number, value: this.state.value};
        }

        this.state.prepareNumber = body.number;
        return {status: 'Ok'};
    }

    acceptAction(body) {
        console.log('accept request');
        if (this.state.number < body.number) {
            this.state.number = body.number;
            this.state.value = body.value;
        }

        console.log('this.state', this.state);
        return {number: this.state.number, value: this.state.value};
    }
}