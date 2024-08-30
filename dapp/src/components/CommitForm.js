import React, { useState } from 'react';

function CommitForm({ contract, web3, auctionId, account, onCommitSuccess }) {
    const [bidAmount, setBidAmount] = useState('');
    const [secret, setSecret] = useState('');

    const handleCommit = async (e) => {
        e.preventDefault();

        try {
            /*const encoded = web3.eth.abi.encodeParameters(['address', 'uint256', 'string'],[account, bidAmount, secret]);
            const commitHash = web3.utils.sha3(encoded, {encoding: 'hex'})*/

            const commitHash = web3.utils.sha3(web3.utils.encodePacked(account, bidAmount, secret));

            console.log('Auction ID:', auctionId);
            console.log('Commit Hash:', commitHash);

            await contract.methods.commitBid(auctionId, commitHash).send({ from: account });

            alert('Bid has been successfully committed!');

            onCommitSuccess(bidAmount);

        } catch (error) {
            console.error('Error during committing:', error);
            alert('Error during committing. Check your console to know more.');
        }
    };

    return (
        <form onSubmit={handleCommit}>
            <div>
                <label>
                    Offer (WEI):
                    <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        required
                    />
                </label>
            </div>
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
            <button type="submit">Commit Offer</button>
        </form>
    );
}

export default CommitForm;
