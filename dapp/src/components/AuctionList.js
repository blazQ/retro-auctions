import React, { useEffect, useState, useCallback } from 'react';
import AuctionCard from './AuctionCard';
import CreateAuction from './CreateAuction';
import DonateAuction from './DonateAuction';

function AuctionList({ contract, wsContract, web3, account }) {
    const [auctions, setAuctions] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showDonateForm, setShowDonateForm] = useState(false);

    const fetchAuctions = useCallback(async () => {
        try {
            const auctionCount = await contract.methods.gamesLength().call();
            const auctionList = [];
            for (let i = 0; i < auctionCount; i++) {
                const auction = await contract.methods.games(i).call();
                auctionList.push(auction);
            }
            setAuctions(auctionList);
        } catch (error) {
            console.error('Error fetching auctions:', error);
        }
    }, [contract]);

    useEffect(() => {
        if (contract) {
            fetchAuctions();
        }
    }, [contract, fetchAuctions]);

    useEffect(() => {
        if (!wsContract) return;

        const eventListener = wsContract.events.GameAdded();

        const onData = () => {
            console.log('Event received, fetching auctions...');
            fetchAuctions();
        };

        const onError = (error) => {
            console.error('Error in event listener:', error);
        };

        eventListener.on('data', onData);
        eventListener.on('error', onError);

    }, [wsContract, fetchAuctions]);

    useEffect(() => {
        console.log('Auctions updated:', auctions); // Log auctions when updated
    }, [auctions]);

    const toggleCreateForm = () => {
        setShowCreateForm(!showCreateForm);
    };

    const toggleDonateForm = () => {
        setShowDonateForm(!showDonateForm);
    }

    return (
        <div>
            <div>
                <CreateAuction contract={contract} web3={web3} account={account} onClose={toggleCreateForm} />
                <DonateAuction contract={contract} web3={web3} account={account} onClose={toggleDonateForm} />
            </div>
            <div className="auction-grid">
                {auctions.length > 0 ? (
                    auctions.map((auction, index) => (
                        <AuctionCard key={index} auction={auction} index={index} web3={web3}/>
                    ))
                ) : (
                    <p>No auctions available.</p>
                )}
            </div>
        </div>
    );
}

export default AuctionList;
