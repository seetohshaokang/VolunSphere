const express = require('express');
const { signUpUser, loginUser, logoutUser } = require('./authController');

const router = express.Router();

router.post('/signup', async (req, res) => {
    const { email, password, confirmpassword, role } = req.body;
    try {
        const result = await signUpUser(email, password, confirmpassword, role);
        if (result) {
            res.status(201).json({ message: "User successfully created", user: result });
        } else {
            res.status(400).json({ message: "Failed to create user" });
        }
    } catch (error) {
        if (error.message === "Email already in use") {
            return res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const loggedInUser = await loginUser(email, password);
        if (loggedInUser) {
            res.status(200).json({ message: "User successfully logged in", user: loggedInUser });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.post('/logout', async (req, res) => {
    await logoutUser();
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;