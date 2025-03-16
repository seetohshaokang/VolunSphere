const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "./.env.server" });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Create Event
const createEvent = async (req, res) => {
    const { name, duration, description, cause, location, organiser } = req.body;

    if (!name || !duration || !description || !cause || !location || !organiser) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const { data, error } = await supabase.from("events").insert([
        { name, duration, description, cause, location, organiser }
    ]).select();

    if (error) {
        return res.status(500).json({ message: "Error creating event", error });
    }
    return res.status(201).json({ message: "Event created successfully", data });
};

// Get All Events
const getEvents = async (req, res) => {
    const { data, error } = await supabase.from("events").select("*");
    if (error) {
        return res.status(500).json({ message: "Error fetching events", error });
    }
    return res.status(200).json(data);
};

// Get Event by ID
const getEventById = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("events").select("*").eq("id", id).single();
    if (error) {
        return res.status(404).json({ message: "Event not found", error });
    }
    return res.status(200).json(data);
};

// Update Event
const updateEvent = async (req, res) => {
    const { id } = req.params;
    const { name, duration, description, cause, location, organiser } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (duration !== undefined) updateData.duration = duration;
    if (description !== undefined) updateData.description = description;
    if (cause !== undefined) updateData.cause = cause;
    if (location !== undefined) updateData.location = location;
    if (organiser !== undefined) updateData.organiser = organiser;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No fields provided for update" });
    }

    const { data, error } = await supabase.from("events").update(updateData).eq("id", id).select();
    if (error) {
        return res.status(500).json({ message: "Error updating event", error });
    }
    return res.status(200).json({ message: "Event updated successfully", data });
};

// Delete Event
const deleteEvent = async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
        return res.status(500).json({ message: "Error deleting event", error });
    }
    return res.status(200).json({ message: "Event deleted successfully" });
};

module.exports = { createEvent, getEvents, getEventById, updateEvent, deleteEvent };
