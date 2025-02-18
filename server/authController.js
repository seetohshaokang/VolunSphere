const { createClient } = require('@supabase/supabase-js');
require("dotenv").config({ path: "./.env.server" });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

//signup
const createAuthUser = async (email, password, confirmpassword) => {  //create new authuser in supabase auth table
    try {
        if (confirmpassword !== password) {
            throw new Error("Passwords do not match");
        }
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) throw error;

        return data;
    } catch (err) {
        console.error("Error creating user:", err.message);
    }
}

const createUser = async (userData) => { //Create new user in users table
    try {
        const { data, error } = await supabase
            .from('users')
            .insert([
                { user_id: userData.user_id, email: userData.email, role: userData.role },
            ])
            .select();

        if (error) {
            throw error;
        }
        return data;
    } catch (err) {
        console.error("Error inserting user: ", err.message);
    }
}

const checkEmailExists = async (email) => { //check if email is already registered
    const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('email', email);

    if (error) {
        console.error("Error checking email:", error);
        throw new Error("Error checking email");
    }

    return data.length > 0;
}

const signUpUser = async (email, password, confirmpassword, role) => {

    const emailExists = await checkEmailExists(email);
    if (emailExists) {
        console.error("Email already in use:", email);
        throw new Error("Email already in use");
    }

    const userResponse = await createAuthUser(email, password, confirmpassword);
    if (userResponse && userResponse.user) {  // Ensure user is present
        const userData = { user_id: userResponse.user.id, email, role };  
        const insertNewUser = await createUser(userData);
        if (insertNewUser) {
            console.log("User successfully created", insertNewUser);
            return { message: "Registration is successful, please confirm your email" }
        }
    } else {
        console.error("Failed to create user or missing user data.");
    }
}


//login 

const loginUser = async (email, password) => { //user login
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if (error) { throw error; }
        return data
    } catch (err) {
        console.error("Error logging in user: ", err.message);
        return null;
    }
}


//logout

const logoutUser = async () => { //needs to call async to wait for response, also to use await before proceeding further
    try {
        const { error } = await supabase.auth.signOut();

        if (error) { throw error; }

        console.log("User has successfully signed out");
    } catch (err) {
        console.error("Error logging out user: ", err.message)
    }
}

module.exports = { logoutUser, loginUser, signUpUser }; //export functions to be used outside of controller