require('dotenv').config();

module.exports = {
    networks: {
        shasta: {
            privateKey: process.env.PRIVATE_KEY_TESTNET,
            userFeePercentage: 100,
            feeLimit: 1500 * 1e6,
            fullHost: 'https://api.shasta.trongrid.io',
            network_id: '*'
        },
        mainnet: {
            privateKey: process.env.PRIVATE_KEY_MAINNET,
            userFeePercentage: 100,
            feeLimit: 5000 * 1e6,
            fullHost: 'https://api.trongrid.io',
            network_id: '1'
        }
    },
    compilers: {
        solc: {
            version: '0.8.6',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                },
                evmVersion: 'istanbul'
            }
        }
    }
};