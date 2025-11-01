/**
 * Скрипт для проверки NFT и метаданных
 * Запуск: node scripts/check_nft.js
 */

const TronWeb = require('tronweb');
require('dotenv').config();

// Конфигурация
const FULL_NODE = 'https://api.shasta.trongrid.io';
const SOLIDITY_NODE = 'https://api.shasta.trongrid.io';
const EVENT_SERVER = 'https://api.shasta.trongrid.io';

// Адрес контракта (замените на ваш)
const CONTRACT_ADDRESS = 'TT46M2bES5JrWLbVUGfZiCvVfz8aHGRypp';

// Инициализация TronWeb (без приватного ключа для чтения)
const tronWeb = new TronWeb(
    FULL_NODE,
    SOLIDITY_NODE,
    EVENT_SERVER
);

async function checkNFT(tokenId, ownerAddress) {
    console.log('=== Проверка NFT ===\n');
    
    try {
        // Подключаемся к контракту
        console.log('Подключение к контракту:', CONTRACT_ADDRESS);
        const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);
        
        // Получаем базовую информацию
        console.log('\n📊 Информация о контракте:');
        const name = await contract.name().call();
        const symbol = await contract.symbol().call();
        const totalSupply = await contract.totalSupply().call();
        const owner = await contract.owner().call();
        const transferable = await contract.transferable().call();
        
        console.log('  Название:', name);
        console.log('  Символ:', symbol);
        console.log('  Общее количество NFT:', totalSupply.toString());
        console.log('  Владелец контракта:', tronWeb.address.fromHex(owner));
        console.log('  Трансферы разрешены:', transferable);
        
        // Проверяем поддержку интерфейсов
        console.log('\n🔍 Проверка интерфейсов:');
        const ERC721_INTERFACE_ID = '0x80ac58cd';
        const ERC721_METADATA_INTERFACE_ID = '0x5b5e139f';
        const ERC165_INTERFACE_ID = '0x01ffc9a7';
        
        const supportsERC721 = await contract.supportsInterface(ERC721_INTERFACE_ID).call();
        const supportsMetadata = await contract.supportsInterface(ERC721_METADATA_INTERFACE_ID).call();
        const supportsERC165 = await contract.supportsInterface(ERC165_INTERFACE_ID).call();
        
        console.log('  ERC721:', supportsERC721 ? '✅' : '❌');
        console.log('  ERC721Metadata:', supportsMetadata ? '✅' : '❌');
        console.log('  ERC165:', supportsERC165 ? '✅' : '❌');
        
        // Проверяем конкретный токен
        if (tokenId) {
            console.log(`\n🎨 Информация о токене #${tokenId}:`);
            
            try {
                const tokenOwner = await contract.ownerOf(tokenId).call();
                const tokenOwnerAddress = tronWeb.address.fromHex(tokenOwner);
                console.log('  Владелец токена:', tokenOwnerAddress);
                
                const tokenURI = await contract.tokenURI(tokenId).call();
                console.log('  Token URI:', tokenURI || '(не установлен)');
                
                if (tokenURI) {
                    console.log('\n  📝 Попытка загрузить метаданные...');
                    try {
                        // Если это IPFS, конвертируем в HTTP gateway
                        let httpURI = tokenURI;
                        if (tokenURI.startsWith('ipfs://')) {
                            const ipfsHash = tokenURI.replace('ipfs://', '');
                            httpURI = `https://ipfs.io/ipfs/${ipfsHash}`;
                            console.log('  IPFS Gateway URL:', httpURI);
                        }
                        
                        const https = require('https');
                        const http = require('http');
                        const client = httpURI.startsWith('https') ? https : http;
                        
                        client.get(httpURI, (res) => {
                            let data = '';
                            res.on('data', chunk => data += chunk);
                            res.on('end', () => {
                                try {
                                    const metadata = JSON.parse(data);
                                    console.log('\n  ✅ Метаданные загружены:');
                                    console.log('     Название:', metadata.name);
                                    console.log('     Описание:', metadata.description);
                                    console.log('     Изображение:', metadata.image);
                                    if (metadata.attributes) {
                                        console.log('     Атрибуты:');
                                        metadata.attributes.forEach(attr => {
                                            console.log(`       - ${attr.trait_type}: ${attr.value}`);
                                        });
                                    }
                                } catch (e) {
                                    console.log('  ❌ Ошибка парсинга JSON:', e.message);
                                }
                            });
                        }).on('error', (e) => {
                            console.log('  ❌ Ошибка загрузки метаданных:', e.message);
                        });
                    } catch (e) {
                        console.log('  ⚠️  Не удалось загрузить метаданные:', e.message);
                    }
                }
            } catch (error) {
                console.log('  ❌ Токен не существует или ошибка:', error.message);
            }
        }
        
        // Проверяем баланс владельца
        if (ownerAddress) {
            console.log(`\n👤 Баланс адреса ${ownerAddress}:`);
            try {
                const balance = await contract.balanceOf(ownerAddress).call();
                console.log('  Количество NFT:', balance.toString());
            } catch (error) {
                console.log('  ❌ Ошибка проверки баланса:', error.message);
            }
        }
        
        console.log('\n✅ Проверка завершена!');
        console.log('\n💡 Для отображения в TronLink:');
        console.log('   1. Убедитесь, что tokenURI возвращает валидный URL');
        console.log('   2. Метаданные должны быть доступны по этому URL');
        console.log('   3. Добавьте NFT вручную в TronLink: Collectibles -> Add NFT');
        console.log(`   4. Используйте Contract Address: ${CONTRACT_ADDRESS}`);
        
    } catch (error) {
        console.error('❌ Критическая ошибка:', error);
    }
}

// Парсинг аргументов командной строки
const args = process.argv.slice(2);
let tokenId = null;
let ownerAddress = null;

if (args.length > 0) {
    tokenId = parseInt(args[0]);
}
if (args.length > 1) {
    ownerAddress = args[1];
}

// Запуск
if (require.main === module) {
    if (args.includes('--help') || args.includes('-h')) {
        console.log('Использование:');
        console.log('  node scripts/check_nft.js [tokenId] [ownerAddress]');
        console.log('\nПримеры:');
        console.log('  node scripts/check_nft.js');
        console.log('  node scripts/check_nft.js 1');
        console.log('  node scripts/check_nft.js 1 TYourAddress...');
        process.exit(0);
    }
    
    checkNFT(tokenId, ownerAddress)
        .then(() => {
            // Даем время на загрузку метаданных
            setTimeout(() => process.exit(0), 2000);
        })
        .catch(err => {
            console.error('❌ Критическая ошибка:', err);
            process.exit(1);
        });
}

module.exports = { checkNFT };


