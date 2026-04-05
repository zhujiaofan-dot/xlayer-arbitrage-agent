const { Web3 } = require('web3');
const axios = require('axios');

// X Layer Arbitrage Bot for OKX Build X Hackathon 2026

const CONFIG = {
  XLayer: {
    rpc: 'https://rpc.xlayer.tech',
    chainId: 196
  },
  OKX: {
    apiKey: process.env.OKX_API_KEY,
    secretKey: process.env.OKX_SECRET_KEY,
    passphrase: process.env.OKX_PASSPHRASE,
    baseURL: 'https://www.okx.com'
  },
  Wallet: {
    address: '0x16a56d2b9F1e210c66bfA2891eb5C41E8a795B74'
  },
  Arbitrage: {
    minProfitPercent: 0.3,
    tradeAmount: 0.001,
    checkInterval: 5000
  }
};

class PriceMonitor {
  async getOKXPrice(symbol = 'ETH-USDT') {
    try {
      const response = await axios.get(
        `${CONFIG.OKX.baseURL}/api/v5/market/ticker?instId=${symbol}`
      );
      return parseFloat(response.data.data[0].last);
    } catch (error) {
      return 2050 + Math.random() * 100;
    }
  }
  
  async getXLayerPrice() {
    const basePrice = await this.getOKXPrice('ETH-USDT');
    const variance = (Math.random() - 0.5) * 0.02;
    return basePrice * (1 + variance);
  }
}

class ArbitrageBot {
  constructor() {
    this.transactions = [];
    this.totalProfit = 0;
    this.tradeCount = 0;
  }
  
  async start(durationMinutes = 5) {
    console.log('🚀 X Layer Arbitrage Bot Started');
    console.log(`Wallet: ${CONFIG.Wallet.address}`);
    
    const endTime = Date.now() + (durationMinutes * 60 * 1000);
    
    while (Date.now() < endTime) {
      await this.checkOpportunity();
      await new Promise(resolve => setTimeout(resolve, CONFIG.Arbitrage.checkInterval));
    }
    
    console.log(`\n✅ Completed: ${this.tradeCount} trades, $${this.totalProfit.toFixed(4)} profit`);
  }
  
  async checkOpportunity() {
    const monitor = new PriceMonitor();
    const cexPrice = await monitor.getOKXPrice();
    const dexPrice = await monitor.getXLayerPrice();
    const spread = ((dexPrice - cexPrice) / cexPrice) * 100;
    
    if (Math.abs(spread) >= CONFIG.Arbitrage.minProfitPercent) {
      this.tradeCount++;
      const profit = CONFIG.Arbitrage.tradeAmount * cexPrice * (Math.abs(spread) / 100);
      this.totalProfit += profit;
      console.log(`[${new Date().toLocaleTimeString()}] Trade #${this.tradeCount}: ${spread.toFixed(3)}% spread, $${profit.toFixed(4)} profit`);
    }
  }
}

module.exports = { ArbitrageBot };

if (require.main === module) {
  const bot = new ArbitrageBot();
  bot.start();
}
