/**
 * @file api.js
 * @description Centralized Axios API library connecting the React frontend to the Django REST backend.
 * Automatically loads the API base URL from the Vite .env config, falling back to localhost:8081 in development.
 */

import axios from "axios";

// Auto-pick API BASE from environment configurations, fallback to dynamic relative bridge path
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

// Create configured axios connection instance
export const api = axios.create({
    baseURL: API_BASE,
    headers: { "Content-Type": "application/json" },
});

// ---- CORE API CRUD FUNCTIONS ----- //

// GET → List & Filters
export const fetchReadings = (params) =>
    api.get("/readings/", { params }).then((res) => res.data);

// POST → Create new reading
export const createReading = (payload) =>
    api.post("/readings/", payload).then((res) => res.data);

// PUT → Full update
export const updateReading = (id, payload) =>
    api.put(`/readings/${id}/`, payload).then((res) => res.data);

// PATCH → Optional (partial update)
export const patchReading = (id, payload) =>
    api.patch(`/readings/${id}/`, payload).then((res) => res.data);

// DELETE → Remove
export const deleteReading = (id) =>
    api.delete(`/readings/${id}/`);
