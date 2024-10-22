import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./App.css";

const API_KEY = "KDDGCO4VNIMBTVDZ"; // Replace with a valid API key
const API_BASE_URL = "https://www.alphavantage.co/query";

function App() {
  const [symbol, setSymbol] = useState("");
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState(new Date());
  const [stocks, setStocks] = useState([]);
  const [showFiltered, setShowFiltered] = useState(false);
  const [sortCriterion, setSortCriterion] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Load settings from local storage
  useEffect(() => {
    const savedStocks = JSON.parse(localStorage.getItem("stocks")) || [];
    const savedShowFiltered =
      JSON.parse(localStorage.getItem("showFiltered")) || false;
    const savedStartDate = localStorage.getItem("startDate")
      ? new Date(localStorage.getItem("startDate"))
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const savedEndDate = localStorage.getItem("endDate")
      ? new Date(localStorage.getItem("endDate"))
      : new Date();

    setStocks(savedStocks);
    setShowFiltered(savedShowFiltered);
    setStartDate(savedStartDate);
    setEndDate(savedEndDate);
  }, []);

  // Save settings to local storage
  useEffect(() => {
    localStorage.setItem("stocks", JSON.stringify(stocks));
    localStorage.setItem("showFiltered", JSON.stringify(showFiltered));
    localStorage.setItem("startDate", startDate);
    localStorage.setItem("endDate", endDate);
  }, [stocks, showFiltered, startDate, endDate]);

  const fetchStockData = async () => {
    if (!symbol) return;

    try {
      const response = await axios.get(API_BASE_URL, {
        params: {
          function: "TIME_SERIES_DAILY",
          symbol: symbol,
          apikey: API_KEY,
        },
      });

      const timeSeries = response.data["Time Series (Daily)"];

      // Check if timeSeries is valid
      if (!timeSeries) {
        console.error(`No data found for symbol: ${symbol}`);
        return;
      }

      const stockData = Object.entries(timeSeries)
        .filter(
          ([date]) => new Date(date) >= startDate && new Date(date) <= endDate
        )
        .map(([date, values]) => ({
          date,
          price: parseFloat(values["4. close"]),
          volume: parseInt(values["5. volume"]),
        }))
        .reverse();

      if (stockData.length > 0) {
        setStocks((prevStocks) => [...prevStocks, { symbol, data: stockData }]);
      } else {
        console.warn(
          `No stock data available for ${symbol} in the specified date range.`
        );
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  };

  const handleAddStock = (e) => {
    e.preventDefault();
    if (symbol && !stocks.find((s) => s.symbol === symbol)) {
      fetchStockData();
      setSymbol(""); // Clear input after submitting
    }
  };

  const handleRemoveStock = (symbolToRemove) => {
    setStocks((prevStocks) =>
      prevStocks.filter((s) => s.symbol !== symbolToRemove)
    );
  };

  // Function to filter stocks based on percentage change
  const filteredStocks = showFiltered
    ? stocks.filter((stock) => {
        const latestData = stock.data[stock.data.length - 1];
        const previousData = stock.data[stock.data.length - 2];
        if (previousData) {
          const change = latestData.price - previousData.price;
          const changePercent = (change / previousData.price) * 100;
          return Math.abs(changePercent) > 2; // Change threshold
        }
        return false; // Exclude stocks without sufficient data
      })
    : stocks;

  // Function to sort stocks by name or price
  const sortedStocks = [...filteredStocks].sort((a, b) => {
    let comparison = 0;

    if (sortCriterion === "name") {
      comparison = a.symbol.localeCompare(b.symbol);
    } else if (sortCriterion === "price") {
      const latestPriceA = a.data[a.data.length - 1].price;
      const latestPriceB = b.data[b.data.length - 1].price;
      comparison = latestPriceA - latestPriceB;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Handle sorting by clicking on the headers
  const handleSort = (criterion) => {
    const isSameCriterion = sortCriterion === criterion;
    const newOrder = isSameCriterion && sortOrder === "asc" ? "desc" : "asc";
    setSortCriterion(criterion);
    setSortOrder(newOrder);
  };

  return (
    <div className="App">
      <header>
        <h1>Stock Market Dashboard</h1>
      </header>
      <main>
        <form onSubmit={handleAddStock} className="controls">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Enter stock symbol (e.g., AAPL)"
          />
          <div className="date-picker">
            <label>Start Date:</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
            />
          </div>
          <div className="date-picker">
            <label>End Date:</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
            />
          </div>
          <button type="submit">Add Stock</button>
        </form>
        <button
          onClick={() => setShowFiltered(!showFiltered)}
          className="filter-button"
        >
          {showFiltered ? "Show All Stocks" : "Show Stocks > 2% Change"}
        </button>

        <table className="stock-table">
          <thead>
            <tr>
              <th
                onClick={() => handleSort("name")}
                style={{ cursor: "pointer" }}
              >
                Symbol{" "}
                {sortCriterion === "name"
                  ? sortOrder === "asc"
                    ? "↑"
                    : "↓"
                  : ""}
              </th>
              <th
                onClick={() => handleSort("price")}
                style={{ cursor: "pointer" }}
              >
                Latest Price{" "}
                {sortCriterion === "price"
                  ? sortOrder === "asc"
                    ? "↑"
                    : "↓"
                  : ""}
              </th>
              <th>Change</th>
              <th>Change Percent</th>
              <th>Volume</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedStocks.length === 0 ? (
              <tr>
                <td colSpan="6">No stocks to display.</td>
              </tr>
            ) : (
              sortedStocks.map((stock) => {
                const latestData = stock.data[stock.data.length - 1];
                const previousData = stock.data[stock.data.length - 2];
                const change = previousData
                  ? latestData.price - previousData.price
                  : 0;
                const changePercent = previousData
                  ? (change / previousData.price) * 100
                  : 0;

                return (
                  <tr key={stock.symbol}>
                    <td>{stock.symbol}</td>
                    <td>${latestData.price.toFixed(2)}</td>
                    <td className={change >= 0 ? "positive" : "negative"}>
                      {change.toFixed(2)}
                    </td>
                    <td className={change >= 0 ? "positive" : "negative"}>
                      {changePercent.toFixed(2)}%
                    </td>
                    <td>{latestData.volume.toLocaleString()}</td>
                    <td>
                      <button onClick={() => handleRemoveStock(stock.symbol)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default App;
