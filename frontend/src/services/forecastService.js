import axios from "axios";

const API = "http://localhost:3000/api";

export const getForecast = (weekStart) =>
  axios.get(`${API}/forecast?weekStart=${weekStart}`);