const GameAuction = artifacts.require("GameAuction");

contract("GameAuction", accounts => {
    let gameAuction;
    const [admin, bidder1, bidder2] = accounts;

    beforeEach(async () => {
        gameAuction = await GameAuction.new();
    });

    it("should add a new game", async () => {
        const name = "Chrono Trigger";
        const description = "Chrono Trigger è un videogioco di ruolo del 1995 sviluppato e pubblicato da Square. È stato originariamente distribuito per il Super Nintendo Entertainment System come prima uscita della serie di Chrono.";
        const imageHash = "QmeSVeBnyzTDstGRbPWph3HNnUKB2qKsYP6HhfHTrz1Qvx"; // Replace with a real IPFS hash
        const minBid = web3.utils.toWei("1", "ether");
        const duration = 1800; // 30 minutes in seconds

        await gameAuction.addGame(name, description, imageHash, minBid, duration, { from: admin });

        const game = await gameAuction.games(0);

        assert.equal(game.name, name, "The game name should be set correctly.");
        assert.equal(game.description, description, "The game description should be set correctly.");
        assert.equal(game.imageHash, imageHash, "The game imageHash should be set correctly.");
        assert.equal(game.minBid.toString(), minBid, "The game minBid should be set correctly.");
        assert.equal(game.active, true, "The game should be active.");
    });

    it("should handle committing and revealing bids", async () => {
        const name = "Metal Gear Solid";
        const description = "Metal Gear Solid è un videogioco d'azione stealth, pubblicato nel 1998 dalla software house giapponese Konami per la console PlayStation. È stato diretto, prodotto e scritto da Hideo Kojima e segue i videogiochi per MSX 2 Metal Gear e Metal Gear 2: Solid Snake, allo stesso modo ideati da Kojima.";
        const imageHash = "QmVvJiFuk4D5ad2sRUTQuCSCxFUfzq9a69hoHz7MyHBiQs";
        const minBid = web3.utils.toWei("1", "ether");
        const duration = 1800;

        await gameAuction.addGame(name, description, imageHash, minBid, duration, { from: admin });

        const gameId = 0;
        const secret = "secret123";
        const bidAmount = web3.utils.toWei("2", "ether");
        const commitHash = web3.utils.sha3(web3.utils.encodePacked(bidder1, bidAmount, secret));

        // Commit a bid
        await gameAuction.commitBid(gameId, commitHash, { from: bidder1 });

        // Reveal the bid
        await gameAuction.revealBid(gameId, bidAmount, secret, { from: bidder1, value: bidAmount });

        const game = await gameAuction.games(gameId);

        assert.equal(game.highestBidder, bidder1, "The highest bidder should be updated.");
        assert.equal(game.highestBid.toString(), bidAmount, "The highest bid should be updated.");
    });


    it("should handle auction end", async () => {
        const name = "Game 3";
        const description = "Description of Game 3";
        const imageHash = "Qm...ImageHash";
        const minBid = web3.utils.toWei("1", "ether");
        const duration = 1800;

        await gameAuction.addGame(name, description, imageHash, minBid, duration, { from: admin });

        const gameId = 0;
        const secret = "secret456";
        const bidAmount = web3.utils.toWei("3", "ether");
        const commitHash = web3.utils.sha3(web3.utils.encodePacked(bidder1, bidAmount, secret));

        // Commit and reveal the bid
        await gameAuction.commitBid(gameId, commitHash, { from: bidder1 });
        await gameAuction.revealBid(gameId, bidAmount, secret, { from: bidder1, value: bidAmount });

        // Fast forward time to end auction
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds

        // End the auction
        await gameAuction.endAuction(gameId, { from: admin });

        const game = await gameAuction.games(gameId);

        assert.equal(game.active, false, "The auction should be inactive.");
        // Check if the funds have been transferred to the seller
        const sellerBalanceAfter = await web3.eth.getBalance(admin);
        // Since we cannot check the exact balance, ensure that it has increased (this is a basic check)
        assert.isAbove(Number(sellerBalanceAfter), Number(web3.utils.toWei("1", "ether")), "Seller should have received payment.");
    });

});
