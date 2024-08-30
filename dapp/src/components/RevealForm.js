import React, { useState } from 'react';

function RevealForm({ contract, web3, auctionId, account, bidAmount}) {
    const [secret, setSecret] = useState('');

    const handleReveal = async (e) => {
        e.preventDefault();
        try {
            console.log(bidAmount);
            console.log(auctionId);

            const committedHash = await contract.methods.getCommittedBid(auctionId).call();
            const stringValue = web3.utils.hexToUtf8(committedHash);
            console.log(stringValue);

            const gasEstimate = await contract.methods.revealBid(auctionId, bidAmount, secret).estimateGas({ from: account, value: bidAmount });
            await contract.methods.revealBid(auctionId, bidAmount, secret).send({
                from: account,
                value: bidAmount,
                gas: gasEstimate
            });

            alert('Bid has been revealed!');
            window.location.reload();
        } catch (error) {
            console.error('Error during revealing:', error);
            alert('Error during revealing. Check your console to know more.');
        }
    };

    return (
        <form onSubmit={handleReveal}>
            <div>
                <label>
                    Secret:
                    <input
                        type="text"
                        value={secret}
                        onChange={(e) => setSecret(e.target.value)}
                        required
                    />
                </label>
            </div>
            <button type="submit">Reveal Offer</button>
        </form>
    );
}

export default RevealForm;
