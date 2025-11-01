/**
 * Скрипт для установки метаданных NFT
 * Запуск: node scripts/set_metadata.js
 */

const TronWeb = require('tronweb');
require('dotenv').config();

// Конфигурация
const FULL_NODE = 'https://api.shasta.trongrid.io';
const SOLIDITY_NODE = 'https://api.shasta.trongrid.io';
const EVENT_SERVER = 'https://api.shasta.trongrid.io';
const PRIVATE_KEY = process.env.PRIVATE_KEY_TESTNET;

// Адрес контракта (замените на ваш)
const CONTRACT_ADDRESS = 'TT46M2bES5JrWLbVUGfZiCvVfz8aHGRypp';

// Инициализация TronWeb
const tronWeb = new TronWeb(
    FULL_NODE,
    SOLIDITY_NODE,
    EVENT_SERVER,
    PRIVATE_KEY
);

async function setMetadata() {
    try {
        console.log('Подключение к контракту...');
        const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);
        
        // Получаем текущий адрес владельца
        const owner = await contract.owner().call();
        const ownerAddress = tronWeb.address.fromHex(owner);
        console.log('Owner контракта:', ownerAddress);
        
        // Проверяем текущий адрес
        const currentAddress = tronWeb.defaultAddress.base58;
        console.log('Ваш адрес:', currentAddress);
        
        if (ownerAddress !== currentAddress) {
            console.error('❌ Ошибка: Вы не являетесь владельцем контракта!');
            return;
        }
        
        // Устанавливаем базовый URI для метаданных
        // ВАЖНО: Это должен быть URL к вашему API или IPFS
        const baseURI = 'https://your-api.com/metadata/'; // или 'ipfs://QmYourCID/'
        
        console.log('Установка базового URI:', baseURI);
        const result = await contract.setBaseURI(baseURI).send({
            feeLimit: 100_000_000,
            callValue: 0,
            shouldPollResponse: true
        });
        
        console.log('✅ Базовый URI установлен!');
        console.log('Transaction ID:', result);
        
        // Пример установки URI для конкретного токена
        const tokenId = 1; // Замените на ID вашего токена
        const tokenURI = 'https://your-api.com/metadata/1.json'; // или 'ipfs://QmYourCID/1.json'
        
        console.log(`\nУстановка URI для токена ${tokenId}:`, tokenURI);
        const result2 = await contract.setTokenURI(tokenId, tokenURI).send({
            feeLimit: 100_000_000,
            callValue: 0,
            shouldPollResponse: true
        });
        
        console.log('✅ URI для токена установлен!');
        console.log('Transaction ID:', result2);
        
        // Проверяем установленный URI
        const retrievedURI = await contract.tokenURI(tokenId).call();
        console.log('\nПроверка: tokenURI =', retrievedURI);
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
    }
}

// Функция для минта NFT с установкой URI сразу
async function mintWithMetadata(recipient, tokenURI) {
    try {
        const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);
        
        console.log('Минт NFT для адреса:', recipient);
        const result = await contract.mint(recipient).send({
            feeLimit: 100_000_000,
            callValue: 0,
            shouldPollResponse: true
        });
        
        console.log('✅ NFT заминчен!');
        console.log('Transaction ID:', result);
        
        // Получаем ID нового токена
        const totalSupply = await contract.totalSupply().call();
        const newTokenId = totalSupply.toNumber();
        console.log('Token ID:', newTokenId);
        
        // Устанавливаем URI для нового токена
        console.log('Установка URI:', tokenURI);
        await contract.setTokenURI(newTokenId, tokenURI).send({
            feeLimit: 100_000_000,
            callValue: 0,
            shouldPollResponse: true
        });
        
        console.log('✅ Метаданные установлены!');
        return newTokenId;
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
    }
}

// Запуск
if (require.main === module) {
    console.log('=== Установка метаданных NFT ===\n');
    setMetadata()
        .then(() => {
            console.log('\n✅ Готово!');
            process.exit(0);
        })
        .catch(err => {
            console.error('❌ Критическая ошибка:', err);
            process.exit(1);
        });
}

module.exports = { setMetadata, mintWithMetadata };


