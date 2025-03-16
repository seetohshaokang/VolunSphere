import apiClient from "./api";

export const loginuser = async (credentials) => {
	try {
		const response = await apiClient.post("/auth/login", credentials);
		return response.data;
	} catch (error) {
		throw error.response?.data || error;
	}
};

export const registerUser = async (userData) => {
	try {
		const response = await apiClient.post("/auth/signup", userData);
		return response.data;
	} catch (error) {
		throw error.response?.data || error;
	}
};

export const logoutUser = async () => {
	try {
		const response = await apiClient.post("/auth/logout");
		return response.data;
	} catch (error) {
		throw error.response?.data || error;
	}
};

export const forgotPassword = async (data) => {
	try {
		const response = await apiClient.post("/auth/forgot-password", data);
		return response.data;
	} catch (error) {
		throw error.response?.data || error;
	}
};
