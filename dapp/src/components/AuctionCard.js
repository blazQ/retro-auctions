import React from 'react';
import { Link } from 'react-router-dom';
import Web3 from 'web3';

function AuctionCard({ auction, index, web3 }) {
    const minBidInEth = web3.utils.fromWei(auction.minBid, 'ether');
    return (
        <div className="auction-card">
            <img src={`http://localhost:8080/ipfs/${auction.imageHash}`} alt={auction.name} />
            <h3>{auction.name}</h3>
            <p>Prezzo di partenza: {minBidInEth} ETH</p>
            <p style={{ color: auction.active ? 'green' : 'red' }}>
                Stato: {auction.active ? 'Attiva' : 'Conclusa'}
            </p>
            <Link to={`/auction/${index}`}>
                <button>Dettagli</button>
            </Link>
        </div>
    );
}

export default AuctionCard;
