# Retro Auctions
A very simple implementation of a retro-videogames auction decentralized app, based on a smart contract written in Solidity.
The auction implements a commit reveal scheme to mitigate front-running attacks and uses Open Zeppelin's nonReentrant modifier to mitigate Reentrancy Attacks, while still using the CEI pattern whenever possible.
The auciton dapp implements a governance scheme where auctioners and sellers partecipate in maintaining the system by closing auctions after their endTime, using a reward system and a donation system.
The dapp is written using react, and most components revolve around handling basic functionalities (i.e: Creating an auction, closing an auction, making a commit, revealing a commit).
It assumes a local blockchain environment in Ganache, as seen in the [configuration file](./truffle-config.js), and uses Truffle for handling smart contract deployment and migration.
It also makes use of a distributed file system, IPFS, to handle auction images that might be relevant to judge the quality of the item on sale.

## Prerequisites
- Truffle v5.11.5 (core: 5.11.5)
- Ganache v7.9.1
- Solidity - 0.8.13 (solc-js)
- Node v21.7.2
- Web3.js v1.10.0
- ipfs version 0.29.0
- react@18.3.1
- @openzeppelin/contracts@4.4.2

Assuming you've got a local ipfs installation, you can simply:

```
ipfs daemon
```

If you've got problems remember to allow CORS:

```
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"*\"]"
```

Fire up Ganache and ensure it is running in the background on port 7545.
Then you're ready to run the install script opening up a new terminal:

```
chmod +x ./setup.sh
./setup.sh
```

And it should migrate and test the contract, then start the React Dapp as per DAPP Readme.

