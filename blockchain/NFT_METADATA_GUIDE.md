# 📖 Руководство по отображению NFT в TronLink

## ❓ Почему NFT не отображаются в TronLink?

TronLink автоматически **НЕ** отображает все NFT. Для отображения нужно:

1. ✅ Контракт должен соответствовать стандарту TRC721 (ваш уже соответствует)
2. ✅ Функция `tokenURI()` должна возвращать валидный URL с метаданными
3. ✅ Метаданные должны быть доступны по этому URL в формате JSON
4. ✅ Контракт должен быть добавлен в TronLink (автоматически или вручную)

## 🔧 Ваш контракт УЖЕ является TRC721!

Стандарты TRC721 (TRON) и ERC721 (Ethereum) **идентичны**. Ваш контракт полностью реализует все необходимые функции и события.

## 📝 Шаги для отображения NFT в TronLink

### **Шаг 1: Настройка метаданных**

NFT отображается в TronLink только если `tokenURI(tokenId)` возвращает URL к JSON файлу с метаданными.

#### **Вариант А: Использовать IPFS (рекомендуется)**

1. Загрузите изображение NFT на IPFS:
   ```bash
   # Через IPFS Desktop или pinata.cloud
   # Получите CID, например: QmYourImageCID
   ```

2. Создайте JSON файл с метаданными (см. `metadata-example.json`):
   ```json
   {
     "name": "SGAA NFT #1",
     "description": "Sale Google Ads Accounts NFT Token",
     "image": "ipfs://QmYourImageCID/image.png",
     "attributes": [
       {
         "trait_type": "Type",
         "value": "Google Ads Account"
       }
     ]
   }
   ```

3. Загрузите JSON на IPFS:
   ```bash
   # Получите CID, например: QmYourMetadataCID
   ```

4. Установите базовый URI в контракте:
   ```javascript
   // В скрипте или через TronScan
   contract.setBaseURI("ipfs://QmYourMetadataCID/")
   ```

5. Для каждого токена установите URI:
   ```javascript
   contract.setTokenURI(1, "ipfs://QmYourMetadataCID/1.json")
   ```

#### **Вариант Б: Использовать собственный API**

1. Создайте API endpoint, который возвращает JSON:
   ```
   GET https://your-api.com/metadata/{tokenId}
   ```

2. Endpoint должен возвращать:
   ```json
   {
     "name": "SGAA NFT #{tokenId}",
     "description": "...",
     "image": "https://your-api.com/images/{tokenId}.png",
     "attributes": [...]
   }
   ```

3. Установите базовый URI:
   ```javascript
   contract.setBaseURI("https://your-api.com/metadata/")
   ```

### **Шаг 2: Использование скрипта для установки метаданных**

Я создал скрипт `scripts/set_metadata.js`. Используйте его:

1. Отредактируйте переменные в скрипте:
   ```javascript
   const CONTRACT_ADDRESS = 'ваш_адрес_контракта';
   const baseURI = 'ipfs://QmYourCID/'; // или https://your-api.com/metadata/
   ```

2. Запустите скрипт:
   ```bash
   cd blockchain
   node scripts/set_metadata.js
   ```

### **Шаг 3: Добавление NFT в TronLink вручную**

После установки метаданных:

1. Откройте **TronLink Wallet**
2. Перейдите в раздел **"Collectibles"** или **"NFT"**
3. Нажмите **"+"** (Add Token/NFT)
4. Выберите **"TRC-721"**
5. Введите:
   - **Contract Address**: `TT46M2bES5JrWLbVUGfZiCvVfz8aHGRypp`
   - **Token ID**: ID вашего токена (например, `1`)
6. Нажмите **"Add"** или **"Confirm"**

### **Шаг 4: Проверка метаданных**

Убедитесь, что метаданные доступны:

1. Проверьте через TronScan:
   ```
   https://shasta.tronscan.org/#/contract/TT46M2bES5JrWLbVUGfZiCvVfz8aHGRypp/code
   ```

2. Вызовите функцию `tokenURI(tokenId)` через "Read Contract"

3. Откройте полученный URL в браузере - должен открыться JSON

## 🎨 Формат метаданных (стандарт OpenSea/TRC721)

```json
{
  "name": "Название NFT",
  "description": "Описание NFT",
  "image": "URL к изображению (ipfs:// или https://)",
  "external_url": "Ссылка на сайт проекта (необязательно)",
  "animation_url": "URL к видео/анимации (необязательно)",
  "attributes": [
    {
      "trait_type": "Название свойства",
      "value": "Значение"
    }
  ],
  "background_color": "HEX цвет фона без # (необязательно)"
}
```

## 📚 Пример использования

### Минт NFT с метаданными:

```javascript
const TronWeb = require('tronweb');
require('dotenv').config();

async function mintNFT() {
    const tronWeb = new TronWeb(
        'https://api.shasta.trongrid.io',
        'https://api.shasta.trongrid.io',
        'https://api.shasta.trongrid.io',
        process.env.PRIVATE_KEY_TESTNET
    );
    
    const contractAddress = 'TT46M2bES5JrWLbVUGfZiCvVfz8aHGRypp';
    const contract = await tronWeb.contract().at(contractAddress);
    
    // 1. Минт токена
    const recipient = 'TYourRecipientAddress...';
    await contract.mint(recipient).send({
        feeLimit: 100_000_000
    });
    
    // 2. Получить ID нового токена
    const totalSupply = await contract.totalSupply().call();
    const tokenId = totalSupply.toNumber();
    
    // 3. Установить URI для токена
    const tokenURI = `ipfs://QmYourCID/${tokenId}.json`;
    await contract.setTokenURI(tokenId, tokenURI).send({
        feeLimit: 100_000_000
    });
    
    console.log(`NFT #${tokenId} создан с метаданными: ${tokenURI}`);
}
```

## ❗ Частые проблемы

### 1. NFT не отображается в TronLink
- ✅ Проверьте, что `tokenURI()` возвращает валидный URL
- ✅ Проверьте, что JSON доступен по этому URL
- ✅ Проверьте, что изображение доступно
- ✅ Попробуйте добавить NFT вручную в TronLink

### 2. Ошибка "transfer to zero address"
- Это нормально, если `transferable = false` в контракте
- Включите трансферы: `contract.setTransferable(true)`

### 3. Метаданные не загружаются
- IPFS: используйте публичные гейтвеи (pinata, infura, cloudflare)
- HTTP: убедитесь, что включен CORS
- Проверьте формат JSON (должен быть валидным)

## 🌐 Полезные ссылки

- TronScan Shasta: https://shasta.tronscan.org/
- IPFS Desktop: https://docs.ipfs.tech/install/ipfs-desktop/
- Pinata (IPFS hosting): https://pinata.cloud/
- NFT Storage: https://nft.storage/

## 📞 Поддержка

Если NFT все еще не отображается:
1. Проверьте логи транзакций на TronScan
2. Убедитесь, что контракт верифицирован
3. Проверьте баланс токенов через `balanceOf(address)`
4. Используйте TronLink в режиме разработчика для отладки


