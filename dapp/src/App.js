import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Web3 from 'web3';
import GameAuctionContract from './artifacts/GameAuction.json';
import AuctionList from './components/AuctionList';
import AuctionDetail from './components/AuctionDetail';
import './App.css';

function App() {
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);
    const [web3, setWeb3] = useState(null);
    const [wsContract, setWsContract] = useState(null);

    useEffect(() => {
        async function loadBlockchainData() {
            if (window.ethereum) {
                // Web3 Provider from MetaMask
                const web3 = new Web3(window.ethereum);

                setWeb3(web3);

                try {
                    // Get account from Metamask
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    setAccount(accounts[0]);

                    const networkId = await web3.eth.net.getId();
                    console.log('Network ID:', networkId);

                    const deployedNetwork = GameAuctionContract.networks[networkId];
                    console.log('Deployed Network:', deployedNetwork);

                    if (deployedNetwork && deployedNetwork.address) {
                        // Get contract ref from deployed Network and the GameAuctionContract.json in src/artifacts/
                        const contract = new web3.eth.Contract(GameAuctionContract.abi, deployedNetwork.address);
                        setContract(contract);
                        console.log('Contract:', contract);

                        const wsWeb3 = new Web3(new Web3.providers.WebsocketProvider('ws://127.0.0.1:7545'));
                        const wsContract = new wsWeb3.eth.Contract(GameAuctionContract.abi, deployedNetwork.address);
                        setWsContract(wsContract);
                        console.log('wsContract:', wsContract);

                    } else {
                        console.error('Contract address not specified');
                    }
                } catch (error) {
                    console.error("Error connecting to MetaMask:", error.message);
                }
            } else {
                console.error('MetaMask is not installed');
            }
        }

        loadBlockchainData();
    }, []);

    return (
        <Router>
            <div className="App">
                <Link to="/" className="app-title">RETRO AUCTIONS</Link>
                <p className="account-info">La tua identità: {account}</p>
                {contract ? (
                    <Routes>
                        <Route path="/" element={<AuctionList contract={contract} wsContract={wsContract} web3={web3} account={account} />} />
                        <Route path="/auction/:index" element={<AuctionDetail contract={contract} wsContract={wsContract} web3={web3} account={account} />} />
                    </Routes>
                ) : (
                    <p>Caricamento del contratto...</p>
                )}
            </div>
        </Router>
    );
}

export default App;
