export const API_URL = "https://kbapp-backend.onrender.com/api";

const getToken = () => localStorage.getItem("token");

const authFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: "Bearer " + token } : {}),
    ...options.headers,
  };
  try {
    const res = await fetch(API_URL + endpoint, { ...options, headers });
    return res.json();
  } catch (e) {
    console.error("API error:", e);
    return { message: "Erreur de connexion" };
  }
};

export const registerUser = (email, password, termsAccepted) =>
  authFetch("/users/register", {
    method: "POST",
    body: JSON.stringify({ email, password, termsAccepted }),
  });

export const loginUser = (email, password) =>
  authFetch("/users/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const forgotPassword = (email) =>
  authFetch("/users/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const getEvents = () => authFetch("/events");
export const getEvent = (id) => authFetch("/events/" + id);

export const getMyTickets = () => authFetch("/tickets");

export const initiatePayment = (eventId, phone, method) =>
  authFetch("/payments/initiate", {
    method: "POST",
    body: JSON.stringify({ eventId, phone, method }),
  });

export const getPaymentStatus = (paymentId) =>
  authFetch("/payments/status/" + paymentId);

export const checkPendingPayment = (eventId) =>
  authFetch("/payments/pending/" + eventId);

export const confirmOrangePayment = (paymentId, transactionId) =>
  authFetch("/payments/confirm-orange", {
    method: "POST",
    body: JSON.stringify({ paymentId, transactionId }),
  });

export const deleteAccount = () =>
  authFetch("/users/delete-account", { method: "DELETE" });
