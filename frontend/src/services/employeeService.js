import axios from "axios";

const API = "http://localhost:3000/api";

export const getEmployees = () =>
  axios.get(`${API}/employees`);

export const createEmployee = (data) =>
  axios.post(`${API}/employees`, data);