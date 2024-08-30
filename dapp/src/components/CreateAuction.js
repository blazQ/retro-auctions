import React, { useState } from 'react';
import { create } from 'ipfs-http-client';

const ipfsClient = create({ url: 'http://127.0.0.1:5001/api/v0' });

function CreateAuction({ contract, account, web3, onClose }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [minBid, setMinBid] = useState('');
    const [duration, setDuration] = useState('');
    const [showForm, setShowForm] = useState('');

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleButtonClick = () => {
        setShowForm(!showForm);
      };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image) {
            alert('Please upload an image');
            return;
        }

        try {
            // Upload image to IPFS
            const added = await ipfsClient.add(image);
            const imageHash = added.path;

            // Create auction on smart contract
            await contract.methods.addGame(name, description, imageHash, minBid, duration).send({ from: account });

            alert('Auction created successfully!');

            onClose();
            window.location.reload();

        } catch (error) {
            console.error('Error creating auction:', error); // Log error details to console
            alert(`Failed to create auction. Error: ${error.message}`); // Show error message to user
        }
    };
      return (
        <div>
          {/* Bottone per creare una nuova asta */}
          <button className="create-auction-button" onClick={handleButtonClick}>
            Create New Auction
          </button>

          {/* Form per creare una nuova asta */}
          <div className={`create-auction-container ${showForm ? 'active' : ''}`}>
            <form onSubmit={handleSubmit} className="create-form">
              <h2>Create a New Auction</h2>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Game Name"
                required
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Game Description"
                required
              />
              <input type="file" onChange={handleFileChange} />
              <input
                type="text"
                value={minBid}
                onChange={(e) => setMinBid(e.target.value)}
                placeholder="Minimum Bid (WEI)"
                required
              />
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Duration (in seconds)"
                required
              />
              <button type="submit">Create Auction</button>
            </form>
          </div>
        </div>
      );
}

export default CreateAuction;
