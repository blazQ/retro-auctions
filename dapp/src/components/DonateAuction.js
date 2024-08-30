import React, { useState } from 'react';

function DonateAuction({ contract, account, web3, onClose }) {
    const [showForm, setShowForm] = useState('');
    const [donationAmount, setDonationAmount] = useState(0);

    const handleButtonClick = () => {
        setShowForm(!showForm);
      };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            // Donate
            await contract.methods.depositFunds().send({ from:account, value: donationAmount});

            alert('Donation was successful!');

            onClose();
            window.location.reload();

        } catch (error) {
            console.error('Error creating auction:', error); // Log error details to console
            alert(`Failed to create auction. Error: ${error.message}`); // Show error message to user
        }
    };
      return (
        <div>
            <button className="create-auction-button" onClick={handleButtonClick}>
            Donate
            </button>
            <div className={`create-auction-container ${showForm ? 'active' : ''}`}>
            <form onSubmit={handleSubmit} className='donation-form'>
                <p> Scegli quanto donare (WEI)</p>
                <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Importo da donare (ETH)"
                    required
                />
                <button type="submit">Dona</button>
            </form>
            </div>
        </div>

      );
}

export default DonateAuction;
