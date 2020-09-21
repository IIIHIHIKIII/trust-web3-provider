// Copyright © 2017-2020 Trust Wallet.
//
// This file is part of Trust. The full Trust copyright notice, including
// terms governing use, modification, and redistribution, is contained in the
// file LICENSE at the root of the source code distribution tree.

"use strict";

require("../index");
const Trust = window.Trust;
const Web3 = require("web3");
const config = {
  address: "0x5Ee066cc1250E367423eD4Bad3b073241612811f",
  chainId: 1,
  rpcUrl: process.env.INFURA_API_KEY ? `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}` : ""
};

describe("TrustWeb3Provider constructor tests", () => {
  test("test constructor.name", () => {
    const provider = new Trust({});
    const web3 = new Web3(provider);
    expect(web3.currentProvider.constructor.name).toBe("TrustWeb3Provider");
  });

  test("test setAddress", () => {
    const provider = new Trust({
      chainId: 1,
      rpcUrl: ""
    });
    const address = "0x5Ee066cc1250E367423eD4Bad3b073241612811f";
    expect(provider.address).toBe("");

    provider.setAddress(address);
    expect(provider.address).toBe(address.toLowerCase());
    expect(provider.ready).toBeTruthy();
  });

  test("test setConfig", done => {
    const mainnet = {
      address: "0xbE74f965AC1BAf5Cc4cB89E6782aCE5AFf5Bd4db",
      chainId: 1,
      rpcUrl: "https://mainnet.infura.io/apikey"
    };
    const ropsten = {
      address: "0xbE74f965AC1BAf5Cc4cB89E6782aCE5AFf5Bd4db",
      chainId: 3,
      rpcUrl: "https://ropsten.infura.io/apikey",
    };
    const provider = new Trust(ropsten);
    const web3 = new Web3(provider);

    expect(web3.currentProvider.chainId).toEqual(3);

    web3.currentProvider.setConfig(mainnet);
    expect(web3.currentProvider.chainId).toEqual(1);
    expect(web3.currentProvider.rpc.rpcUrl).toBe(mainnet.rpcUrl);

    expect(provider.request).not.toBeUndefined;
    expect(provider.on).not.toBeUndefined;

    web3.version.getNetwork((error, id) => {
      expect(id).toBe("1");
      done();
    });
  });

  test("test eth_chainId", done => {
    const ropsten = {
      address: "0xbE74f965AC1BAf5Cc4cB89E6782aCE5AFf5Bd4db",
      chainId: 3,
      rpcUrl: "https://ropsten.infura.io/apikey",
    };
    const provider = new Trust(ropsten);
    const web3 = new Web3(provider);

    let request = {jsonrpc: "2.0", method: "eth_chainId", id: 123};

    provider.request(request).then((chainId) => {
      expect(chainId).toEqual("0x3");
      done();
    });

    const response = web3.currentProvider.send(request);
    expect(response.result).toBe("0x3");

    web3.currentProvider.sendAsync(request, (error, result) => {
      expect(result.result).toEqual("0x3");
      done();
    });
  });

  test("test eth_accounts", done => {
    const provider = new Trust(config);
    const web3 = new Web3(provider);
    const addresses = ["0x5ee066cc1250e367423ed4bad3b073241612811f"];

    web3.eth.getAccounts((error, accounts) => {
      expect(accounts).toEqual(addresses);
      done();
    })

    provider.request({method: "eth_accounts"}).then((accounts) => {
      expect(accounts).toEqual(addresses);
      done();
    });

    web3.currentProvider.sendAsync({method: "eth_accounts"}, (error, data) => {
      expect(data.result).toEqual(addresses);
      done();
    });
  });
});
