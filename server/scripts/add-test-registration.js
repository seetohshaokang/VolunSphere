const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
const Volunteer = require('../models/Volunteer'); 
const EventRegistration = require('../models/EventRegistration');
require('dotenv').config({ path: '../.env.server' });

// Use the MongoDB connection string from environment variables or default
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/volunsphere';

async function addTestRegistration() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get a volunteer user
    const volunteer = await User.findOne({ role: 'volunteer' });
    if (!volunteer) {
      console.error('No volunteer user found');
      return;
    }
    console.log(`Selected volunteer: ${volunteer.email} (${volunteer._id})`);

    // Get the volunteer profile
    const volunteerProfile = await Volunteer.findOne({ user_id: volunteer._id });
    if (!volunteerProfile) {
      console.error('No volunteer profile found for user');
      return;
    }
    console.log(`Found volunteer profile: ${volunteerProfile._id}`);

    // Get an active event
    const event = await Event.findOne({ status: 'active' });
    if (!event) {
      console.error('No active event found');
      return;
    }
    console.log(`Selected event: ${event.name} (${event._id})`);

    // Check the schema fields in the model
    console.log('EventRegistration schema paths:', Object.keys(EventRegistration.schema.paths));

    // Check if registration already exists
    const existingRegistration = await EventRegistration.findOne({
      user_id: volunteer._id,
      event_id: event._id
    });

    if (existingRegistration) {
      console.log('Registration already exists:');
      console.log(`- ID: ${existingRegistration._id}`);
      console.log(`- Status: ${existingRegistration.status}`);
      console.log(`- User ID: ${existingRegistration.user_id}`);
      console.log(`- Event ID: ${existingRegistration.event_id}`);
      
      // Update the registration to add the volunteer_id field - this won't work if it's not in the schema
      try {
        existingRegistration.set({ volunteer_id: volunteerProfile._id });
        await existingRegistration.save();
        console.log('Updated existing registration with volunteer_id');
      } catch (err) {
        console.log('Could not update with volunteer_id:', err.message);
      }
      return;
    }

    // Create a new registration - only use fields that are in the schema
    const registrationData = {
      user_id: volunteer._id,
      event_id: event._id,
      status: 'confirmed',
      signup_date: new Date()
    };
    
    // Only add volunteer_id if it's in the schema
    if (EventRegistration.schema.paths.volunteer_id) {
      registrationData.volunteer_id = volunteerProfile._id;
    }

    const registration = new EventRegistration(registrationData);

    // Save the registration
    await registration.save();
    console.log('Successfully created test registration:');
    console.log(`- ID: ${registration._id}`);
    console.log(`- Status: ${registration.status}`);
    console.log(`- User ID: ${registration.user_id}`);
    if (registration.volunteer_id) {
      console.log(`- Volunteer ID: ${registration.volunteer_id}`);
    } else {
      console.log('- No volunteer_id field in the model');
    }
    console.log(`- Event ID: ${registration.event_id}`);

    // Update the event's registered_count
    await Event.findByIdAndUpdate(event._id, { $inc: { registered_count: 1 } });
    console.log(`Updated event registered_count`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the database connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
addTestRegistration(); 