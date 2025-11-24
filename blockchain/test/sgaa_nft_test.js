const GADS = artifacts.require("GADS");

contract("GADS", (accounts) => {
    let nft;
    const owner = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];

    beforeEach(async () => {
        nft = await GADS.new({ from: owner });
    });

    it("должен иметь правильные имя и символ", async () => {
        const name = await nft.name();
        const symbol = await nft.symbol();

        assert.equal(name, "GOOGLE ADS ACCOUNT STORE");
        assert.equal(symbol, "GADS");
    });

    it("должен минтить токен только владельцем", async () => {
        await nft.mint(user1, { from: owner });
        const balance = await nft.balanceOf(user1);

        assert.equal(balance.toString(), "1");
    });

    it("не должен позволять минт не-владельцу", async () => {
        try {
            await nft.mint(user1, { from: user1 });
            assert.fail("Должна быть ошибка");
        } catch (error) {
            assert.include(error.message, "caller is not the owner");
        }
    });

    it("не должен позволять передачу когда transferable = false", async () => {
        await nft.mint(user1, { from: owner });

        try {
            await nft.transferFrom(user1, user2, 1, { from: user1 });
            assert.fail("Должна быть ошибка");
        } catch (error) {
            assert.include(error.message, "transfers are disabled");
        }
    });

    it("должен позволять передачу когда transferable = true", async () => {
        await nft.mint(user1, { from: owner });
        await nft.setTransferable(true, { from: owner });
        await nft.transferFrom(user1, user2, 1, { from: user1 });

        const newOwner = await nft.ownerOf(1);
        assert.equal(newOwner, user2);
    });

    it("должен позволять владельцу передавать даже при transferable = false", async () => {
        await nft.mint(user1, { from: owner });
        await nft.transferFrom(user1, user2, 1, { from: owner });

        const newOwner = await nft.ownerOf(1);
        assert.equal(newOwner, user2);
    });

    it("должен минтить batch токены", async () => {
        const recipients = [user1, user2, accounts[3]];
        await nft.mintBatch(recipients, { from: owner });

        const balance1 = await nft.balanceOf(user1);
        const balance2 = await nft.balanceOf(user2);

        assert.equal(balance1.toString(), "1");
        assert.equal(balance2.toString(), "1");
    });

    it("должен сжигать токены", async () => {
        await nft.mint(user1, { from: owner });
        await nft.burn(1, { from: owner });

        try {
            await nft.ownerOf(1);
            assert.fail("Токен должен быть сожжен");
        } catch (error) {
            assert.include(error.message, "token does not exist");
        }
    });
});