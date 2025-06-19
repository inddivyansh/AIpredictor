import axios from "axios";

const API_KEY = "wc3OpmNY53ASCf9JsIpieIz4ZnQRx0xc";
const BASE_URL = "https://api.polygon.io";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchMultipleStocks = async (symbols = []) => {
  const results = [];

  for (const symbol of symbols) {
    try {
      const response = await axios.get(
        `${BASE_URL}/v2/aggs/ticker/${symbol}/prev`,
        {
          params: { apiKey: API_KEY },
        }
      );
      results.push({
        ticker: symbol,
        ...response.data.results?.[0],
      });
    } catch (error) {
      console.error(`❌ Error fetching ${symbol}:`, error.response?.data?.error || error.message);
    }

    await delay(1000); // Delay to prevent hitting rate limits
  }

  return results;
};

