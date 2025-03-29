import Api from "./Api";

export const loginUser = async (credentials) => {
	try {
		const response = await Api.loginUser(credentials);
		const data = await response.json();

		if (data.token) {
			localStorage.setItem("token", data.token);
			localStorage.setItem("user", JSON.stringify(data.user));
		}
		return data;
	} catch (error) {
		throw error.response?.data || error;
	}
};

export const registerUser = async (userData) => {
	try {
		const response = await Api.registerUser(userData);
		return response.json();
	} catch (error) {
		throw error.response?.data || error;
	}
};

export const logoutUser = async () => {
	try {
		await Api.logoutUser();
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		return { success: true };
	} catch (error) {
		throw error.response?.data || error;
	}
};

export const forgotPassword = async (data) => {
	try {
		const response = await Api.forgotPassword(data);
		return response.json();
	} catch (error) {
		throw error.response?.data || error;
	}
};

export const getCurrentUser = () => {
	const userStr = localStorage.getItem("user");
	if (userStr) {
		return JSON.parse(userStr);
	}
	return null;
};

export const isAuthenticated = () => {
	return localStorage.getItem("token") !== null;
};
