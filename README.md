# Stock Market Dashboard

A React-based application that allows users to track stock prices, filter by percentage change, and sort by stock name or latest price. The app uses the Alpha Vantage API to fetch stock data and stores user preferences in local storage for persistence.

## Features

- **Stock Tracking**: Add and display stock symbols with their latest prices, changes, and volumes.
- **Date Filtering**: Select a date range to view stock data.
- **Percentage Change Filter**: Display only stocks that have changed by more than 2%.
- **Sorting**: Click on column headers to sort stocks by name or latest price, toggling between ascending and descending order.
- **Local Storage**: User settings (stocks, date range, filter visibility) are saved in local storage for persistence across sessions.

## Technologies Used

- React
- Axios for API requests
- React DatePicker for date selection
- Alpha Vantage API for stock data

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Haseeb-rehman66/stock-market-dashboard.git

   ```

2. Navigate to the project directory:
   ```bash
   cd stock-market-dashboard
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. To start the application, run:
   ```bash
   npm start
   ```
