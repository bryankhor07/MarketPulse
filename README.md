# Crypto & Stocks Dashboard

A real-time financial dashboard displaying cryptocurrency and stock market data with interactive charts, watchlists, and price alerts.

## Features

- **Real-time Market Data**: Live crypto and stock prices with top movers
- **Interactive Charts**: Price history visualization using Recharts
- **Watchlists**: Track your favorite assets
- **Price Alerts**: Get notified when prices hit your targets
- **News Integration**: Latest market news and updates
- **Responsive Design**: Works on desktop and mobile devices

## APIs Used

### CoinGecko API (Cryptocurrency Data)

- **Market Data**: `/coins/markets` - Top cryptocurrencies with price, market cap, and 24h changes
- **Historical Data**: `/coins/{id}/market_chart` - Price history for chart visualization
- **Documentation**: [CoinGecko API Docs](https://www.coingecko.com/en/api/documentation)

### Finnhub API (Stock Market Data)

- **Real-time Quotes**: `/quote` - Latest stock prices and daily statistics
- **Historical Data**: `/stock/candle` - OHLC data for candlestick charts
- **Market News**: `/news` - Latest financial news and market updates
- **Documentation**: [Finnhub API Docs](https://finnhub.io/docs/api)

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **Charts**: Recharts
- **State Management**: TanStack React Query
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd mkt-dashboard
```

2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
mkt-dashboard/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── lib/           # API utilities
│   ├── context/       # React context providers
│   ├── hooks/         # Custom React hooks
│   └── utils/         # Helper functions
├── public/            # Static assets
└── ...config files
```

## License

MIT License
