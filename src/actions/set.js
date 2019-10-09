const request = require('request');

function sendRequest(options) {
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

exports.setAction = async function(body, servers) {
    const value = body.value;
    const proposalNumber = new Date().getTime();
    let result = {};

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

        result[servers[i]] = await sendRequest(options);
    }

    console.log(result);
}