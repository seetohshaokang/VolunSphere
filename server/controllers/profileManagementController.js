const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "./.env.server" });
const multer = require("multer");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const fetchProfile = async (req, res) => {
    const user = req.user; //Assuming user is set in the request
    try {
        const { data, error } = await supabase //retrieve 1 row based on auth_id column
            .from('users')
            .select('*')
            .eq('auth_id', user.id)
            .single();

        if (error) {
            console.error("Error fetching user data: ", error);
            return res.status(500).json({ error: 'An error occurred while fetching the profile' });
        }

        return res.json(data);
    } catch (error) {
        console.log("Error fetching user data: ", error);
        return res.status(500).json({ error: 'An error occurred while fetching the profile' });
    }
}

const updateProfilePicture = async (req, res) => {

    const user = req.user; //Assuming user is set in the request
    const filePath = `profileimages/${user.id}-${Date.now()}-${req.file.originalname}`; //unique filepath

    const { data, error } = await supabase.storage //upload the image into the bucket "profileimages"
        .from('profileimages')
        .upload(filePath, req.file.buffer, { contentType: req.file.mimetype }); //req.file.buffer refers to the actual file data from multer

    if (error) {
        console.error("Error uploading image: ", error);
    }

    const { publicUrl } = supabase.storage.from("profileimages").getPublicUrl(filePath); //get the public url of uploaded image in bucket

    const { data: userData, error: fetchError } = await supabase //fetch user data
        .from("users")
        .select("profile_picture_url")
        .eq("auth_id", user.id)
        .single();

    if (fetchError) {
        console.error("Error fetching user data:", fetchError);
    }

    const currentImageUrl = userData?.profile_picture_url; //this is the current profilepicture url of user

    const { error: deleteError } = await supabase.storage //remove current profilepicture from the storage bucket
        .from("profileimages")
        .remove([currentImageUrl]); //Supabase expects an array, so must []
    ``
    if (deleteError) {
        console.error("Error deleting file:", deleteError);
    }

    const { data: updateData, error: updateError } = await supabase //update the picture url in supabase column
        .from("users")
        .update({ profile_picture_url: publicUrl })
        .eq("auth_id", user.id);

    if (updateError) {
        console.error("Error updating profile picture: ", updateError);
    }
}

const editProfile = async (req, res) => {
    const user = req.user; //Assuming user is set in the request
    console.log(req.body);
    const { name, dob, phone, bio, address } = req.body; //Assuming all these is sent from frontend, can be null
    const updateData = {};

    if (name !== undefined) updateData.name = name; // check if any field is undefined (can remove if frontend doing the check)
    if (dob !== undefined) updateData.dob = dob;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (address !== undefined) updateData.address = address;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No new data provided for update." });
    }

    const { data, error } = await supabase // update all the fields except profilePictureUrl
        .from('users')
        .update(updateData)
        .eq('auth_id', user.id)
        .select();

    if (req.file) {
        await updateProfilePicture(req, res); //update profilepicture url
    }

    if (error) {
        return res.status(500).json({ error: "Failed to update user profile" });
    }
    return res.json({ message: "Profile updated successfully", data });
}

const deleteProfile = async (req, res) => {
    const userId = req.user.id; //fetch users id
    try {
        const { error } = await supabase.auth.admin.deleteUser(userId);
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        console.log("Successfully deleted user profile");
        return res.status(200).json({ message: "Successfully deleted user profile" });
    } catch (error) {
        console.log("Error deleting user profile: ", error);
        return res.status(500).json({ error: 'An error occurred while deleting the user.' });
    }
}

module.exports = { fetchProfile, editProfile, deleteProfile };