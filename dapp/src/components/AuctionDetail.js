import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CommitForm from './CommitForm';
import RevealForm from './RevealForm';

function AuctionDetail({ contract, wsContract, web3, account}) {
    const {index} = useParams();
    const [auction, setAuction] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [showCommitForm, setShowCommitForm] = useState(null);
    const [showRevealForm, setShowRevealForm] = useState(null);
    const [bidAmount, setBidAmount] = useState(null);

    useEffect(() => {
        async function fetchAuctionDetail() {
            try {
                const auction = await contract.methods.games(index).call();

                const formattedAuction = {
                    ...auction,
                    minBid: auction.minBid.toString(),
                    highestBid: auction.highestBid.toString(),
                    endTime: auction.endTime.toString()
                };
                setAuction(formattedAuction);
                toggleCommitForm();
            } catch (error) {
                console.error("Error fetching auction details:", error);
            }
        }

        if (contract) {
            fetchAuctionDetail();
        }
    }, [contract, index]);

    const toggleCommitForm = () => {
        setShowCommitForm(!showCommitForm);
    };

    const toggleRevealForm = () => {
        setShowRevealForm(!showRevealForm);
    }

    const handleCommitSuccess = (amount) => {
        setBidAmount(amount);
        toggleCommitForm();
        toggleRevealForm();
    };

    const handleRevealSuccess = (amount) => {
        toggleRevealForm();
        toggleCommitForm();
    }

    const handleCloseAuction = async () => {
        try {
            await contract.methods.endAuction(index).send({ from: account });
            alert('Asta chiusa con successo!');
            window.location.reload();
        } catch (error) {
            console.error("Error closing auction:", error);
            alert('Errore nella chiusura dell\'asta.');
        }
    };

    if (!auction) {
        return <p>Caricamento dei dettagli dell'asta...</p>;
    }

    const endDate = new Date(auction.endTime * 1000);
    const now = new Date();
    const isAuctionOpen = auction.active && endDate > now;
    const isSeller = auction.seller.toLowerCase() == account;
    const isAuctionActive = auction.active;

    return (
        <div className='auction-detail-card'>
            <h2>{auction.name}</h2>
            <img src={`http://localhost:8080/ipfs/${auction.imageHash}`} alt={auction.name} />
            <p><strong>Descrizione:</strong> {auction.description}</p>
            <p><strong>Prezzo di partenza:</strong> {auction.minBid} Wei</p>
            <p><strong>Offerta più alta:</strong> {auction.highestBid} Wei</p>
            <p><strong>Data di fine:</strong> {endDate.toString()}</p>
            <p className={`auction-status ${isAuctionOpen ? 'open' : 'closed'}`}>
                Stato: {isAuctionActive ? "Aperta" : "Chiusa"}
            </p>

            {(!isAuctionOpen || isSeller) && isAuctionActive && (
                <button onClick={handleCloseAuction}>Chiudi Asta</button>
            )}

            {isAuctionOpen && showCommitForm && !isSeller && (
                <div className="commit-form">
                    <CommitForm
                        contract={contract}
                        web3={web3}
                        auctionId={index}
                        account={account}
                        onCommitSuccess={handleCommitSuccess}/>
                </div>

            )}

            {isAuctionOpen && showRevealForm && !isSeller && (
                <div>
                    <RevealForm
                        contract={contract}
                        web3={web3}
                        auctionId={index}
                        account={account}
                        bidAmount={bidAmount}
                        onRevealSuccess={handleRevealSuccess}
                    />
                </div>
            )}
        </div>
    );
}

export default AuctionDetail;
