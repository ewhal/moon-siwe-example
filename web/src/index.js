import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';

window.addEventListener('load', function () {

    document.getElementById('siw-ethereum').addEventListener('click', async function (event) {
        if (typeof window.ethereum == 'undefined') { return; }

        event.preventDefault();

        const address = await ethereum.request({ method: 'eth_requestAccounts' })
            .then(function (accounts) {
                console.log(accounts);
                return accounts[0];
            });
        console.log(address);
        return fetch('https://vault-api.usemoon.ai/auth/ethereum/challenge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                address: address,
            })
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (json) {
                return ethereum.request({ method: 'eth_requestAccounts' })
                    .then(function (accounts) {
                        return [accounts[0], json.nonce];
                    });
            })
            .then(function (args) {
                const account = args[0];
                const address = ethers.utils.getAddress(account);
                const message = new SiweMessage({
                    domain: window.location.host,
                    address: address,
                    statement: 'Sign in with Ethereum to the app.',
                    uri: window.location.origin,
                    version: '1',
                    chainId: '1',
                    nonce: args[1]
                });

                const m = message.prepareMessage();
                return ethereum.request({
                    method: 'personal_sign',
                    params: [m, address]
                })
                    .then(function (signature) {
                        return [m, signature];
                    });
            })
            .then(function (args) {
                return fetch('https://vault-api.usemoon.ai/auth/ethereum', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ message: args[0], signature: args[1], address }),
                });
            })
            .then(function (response) {
                return response.json();
            })
            .then(function (json) {
                console.log(json);
                // window.location.href = json.location;
            });
    });

});
