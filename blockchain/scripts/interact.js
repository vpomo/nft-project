const TronWeb = require('tronweb');
require('dotenv').config();

const fullNode = 'https://api.trongrid.io';
const solidityNode = 'https://api.trongrid.io';
const eventServer = 'https://api.trongrid.io';
const privateKey = process.env.PRIVATE_KEY_MAINNET;

const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);

// Адрес задеплоенного контракта
const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS_HERE';

// ABI контракта (скопируйте из build/contracts/SGAA_NFT.json)
const CONTRACT_ABI = [/* ABI здесь */];

async function main() {
    const contract = await tronWeb.contract(CONTRACT_ABI, CONTRACT_ADDRESS);

    // 1. Минт одного NFT
    console.log('=== Минт одного NFT ===');
    const recipient = 'TAddress123...';
    const mintTx = await contract.mint(recipient).send({
        feeLimit: 100_000_000
    });
    console.log('Token minted, TX:', mintTx);

    // 2. Массовый минт
    console.log('\n=== Массовый минт NFT ===');
    const recipients = [
        'TAddress1...',
        'TAddress2...',
        'TAddress3...'
    ];
    const batchMintTx = await contract.mintBatch(recipients).send({
        feeLimit: 300_000_000
    });
    console.log('Batch minted, TX:', batchMintTx);

    // 3. Проверка баланса
    console.log('\n=== Проверка баланса ===');
    const balance = await contract.balanceOf(recipient).call();
    console.log('Balance:', balance.toString());

    // 4. Проверка статуса transferable
    console.log('\n=== Статус передачи ===');
    const isTransferable = await contract.transferable().call();
    console.log('Transferable:', isTransferable);

    // 5. Включение передачи
    console.log('\n=== Включение передачи ===');
    const setTransferableTx = await contract.setTransferable(true).send({
        feeLimit: 50_000_000
    });
    console.log('Transferable enabled, TX:', setTransferableTx);

    // 6. Установка Base URI
    console.log('\n=== Установка Base URI ===');
    const baseURI = 'https://api.example.com/metadata/';
    const setURITx = await contract.setBaseURI(baseURI).send({
        feeLimit: 50_000_000
    });
    console.log('Base URI set, TX:', setURITx);

    // 7. Получение URI токена
    console.log('\n=== URI токена ===');
    const tokenId = 1;
    const tokenURI = await contract.tokenURI(tokenId).call();
    console.log('Token URI:', tokenURI);

    // 8. Сжигание токена
    console.log('\n=== Сжигание токена ===');
    const burnTx = await contract.burn(tokenId).send({
        feeLimit: 100_000_000
    });
    console.log('Token burned, TX:', burnTx);

    // 9. Массовое сжигание
    console.log('\n=== Массовое сжигание ===');
    const tokenIdsToBurn = [2, 3, 4];
    const batchBurnTx = await contract.burnBatch(tokenIdsToBurn).send({
        feeLimit: 200_000_000
    });
    console.log('Batch burned, TX:', batchBurnTx);

    // 10. Получение общего supply
    console.log('\n=== Total Supply ===');
    const totalSupply = await contract.totalSupply().call();
    console.log('Total Supply:', totalSupply.toString());
}

main().catch(console.error);