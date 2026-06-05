import axios from "axios";

const API = "http://localhost:3000/api";

export const getTasks = () =>
  axios.get(`${API}/tasks`);

export const createTask = (data) =>
  axios.post(`${API}/tasks`, data);