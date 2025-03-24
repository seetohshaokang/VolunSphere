import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
//import { format } from 'date-fns'; // Optional for better date formatting
import Navbar from '../layout/Navbar';
import './EventDetail.css';

// API base URL from environment variables
const API_URL = import.meta.env.VITE_API_URL;

function EventDetail() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRegistered, setIsRegistered] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [error, setError] = useState(null);

    // Fetch event details
    useEffect(() => {
        const fetchEventDetails = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await axios.get(`${API_URL}/events/${eventId}`);
                setEvent(response.data);
                
                // Check if user is logged in, fetch registration status
                if (user) {
                    checkRegistrationStatus();
                }
            } catch (err) {
                console.error("Error fetching event details:", err);
                setError("Failed to load event details. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchEventDetails();
    }, [eventId, user]);

    // Check if user is already registered
    const checkRegistrationStatus = async () => {
        try {
            // Get token from Supabase auth (adjust based on your auth implementation)
            const token = await user.getIdToken();
            
            const response = await axios.get(`${API_URL}/events/user/registered`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Check if this event is in the list of registrations
            const isUserRegistered = response.data.some(
                registration => registration.event_id === parseInt(eventId)
            );
            
            setIsRegistered(isUserRegistered);
        } catch (err) {
            console.error("Error checking registration status:", err);
            // Non-critical error, don't show to user
        }
    };

    const handleRegisterClick = () => {
        if (!user) {
            // Redirect to login if not logged in
            navigate('/login', { state: { from: `/event/${eventId}` } });
            return;
        }
        
        // Show confirmation modal
        setShowConfirmModal(true);
    };

    const confirmRegistration = async () => {
        try {
            const token = await user.getIdToken();
            
            await axios.post(
                `${API_URL}/events/${eventId}/register`, 
                {}, // Empty body
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            setIsRegistered(true);
            setShowConfirmModal(false);
            setRegistrationSuccess(true);
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                setRegistrationSuccess(false);
            }, 3000);
        } catch (err) {
            console.error("Error registering for event:", err);
            setError(err.response?.data?.message || "Failed to register for event");
            setShowConfirmModal(false);
        }
    };

    const cancelRegistration = () => {
        setShowConfirmModal(true);
    };

    const confirmCancellation = async () => {
        try {
            const token = await user.getIdToken();
            
            await axios.delete(`${API_URL}/events/${eventId}/register`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setIsRegistered(false);
            setShowConfirmModal(false);
        } catch (err) {
            console.error("Error cancelling registration:", err);
            setError(err.response?.data?.message || "Failed to cancel registration");
            setShowConfirmModal(false);
        }
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="container" style={{ paddingTop: '80px' }}>
                    <div className="text-center my-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2">Loading event details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Navbar />
                <div className="container" style={{ paddingTop: '80px' }}>
                    <div className="alert alert-danger my-5">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div>
                <Navbar />
                <div className="container" style={{ paddingTop: '80px' }}>
                    <div className="alert alert-danger my-5">
                        Event not found or has been removed.
                    </div>
                </div>
            </div>
        );
    }

    // Format date strings
    const formatDateRange = () => {
        if (event.duration) return event.duration;
        
        try {
            const startDate = new Date(event.start_date);
            const endDate = new Date(event.end_date);
            return `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`;
        } catch (err) {
            return `${event.start_date} - ${event.end_date}`;
        }
    };

    // Process data for display
    const formattedEvent = {
        title: event.name,
        organizer: event.organizer_name || "Organization",
        date: formatDateRange(),
        specificDates: event.specific_dates ? event.specific_dates.split(',').map(date => date.trim()) : [],
        location: event.location,
        category: event.cause,
        tags: event.tags ? event.tags.split(',').map(tag => tag.trim()) : [event.cause],
        remainingSlots: (event.max_volunteers || 10) - (event.registered_count || 0),
        totalSlots: event.max_volunteers || 10,
        description: event.description,
        requirements: event.requirements ? event.requirements.split(',').map(req => req.trim()) : [],
        responsibilities: event.responsibilities ? event.responsibilities.split(',').map(resp => resp.trim()) : [],
        contactPerson: event.contact_person || "Contact person",
        contactEmail: event.contact_email || "contact@email.com",
        imageUrl: event.image_url || "/src/assets/event-placeholder.jpg",
        status: event.status || "active"
    };

    return (
        <div>
            <Navbar />
            
            <div className="event-detail-container">
                {/* Breadcrumb navigation */}
                <div className="breadcrumb-container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><a href="/">Home</a></li>
                            <li className="breadcrumb-item"><a href="/volunteer">Volunteer</a></li>
                            <li className="breadcrumb-item active" aria-current="page">{formattedEvent.title}</li>
                        </ol>
                    </nav>
                </div>

                {/* Event header */}
                <div className="event-header">
                    <h1>{formattedEvent.title}</h1>
                    <div className="organizer-badge">
                        <img src="/src/assets/org-logo.svg" alt="Organization logo" className="org-logo" />
                        <span>{formattedEvent.organizer}</span>
                    </div>
                    
                    <div className="share-btn">
                        <button className="btn btn-outline-secondary btn-sm">
                            <i className="bi bi-share"></i> Share
                        </button>
                    </div>
                </div>

                <div className="event-content">
                    {/* Registration success message */}
                    {registrationSuccess && (
                        <div className="alert alert-success alert-dismissible fade show" role="alert">
                            You have successfully registered for this event!
                            <button type="button" className="btn-close" onClick={() => setRegistrationSuccess(false)}></button>
                        </div>
                    )}

                    {/* Main content grid */}
                    <div className="event-grid">
                        <div className="event-main">
                            {/* Image carousel */}
                            <div className="event-image-container">
                                <img src={formattedEvent.imageUrl} alt={formattedEvent.title} className="event-image" />
                            </div>

                            {/* Cause tags */}
                            <div className="event-causes">
                                <h5>Supported causes</h5>
                                <div className="causes-tags">
                                    {formattedEvent.tags.map((tag, index) => (
                                        <span key={index} className="cause-tag">
                                            {tag.includes("Community") && <i className="bi bi-people-fill"></i>}
                                            {tag.includes("Education") && <i className="bi bi-book-fill"></i>}
                                            {tag.includes("Social") && <i className="bi bi-heart-fill"></i>}
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* About the opportunity */}
                            <div className="event-section">
                                <h3>About the opportunity</h3>
                                <p>{formattedEvent.description}</p>

                                <div className="event-details">
                                    <div className="detail-item">
                                        <h5>Day and time of sessions</h5>
                                        <p>{formattedEvent.date}</p>
                                        {formattedEvent.specificDates.length > 0 && (
                                            <ul className="specific-dates">
                                                {formattedEvent.specificDates.map((date, index) => (
                                                    <li key={index}>{date}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="detail-item">
                                        <h5>Location</h5>
                                        <p>{formattedEvent.location}</p>
                                    </div>

                                    {formattedEvent.requirements.length > 0 && (
                                        <div className="detail-item">
                                            <h5>Basic requirements</h5>
                                            <ul>
                                                {formattedEvent.requirements.map((req, index) => (
                                                    <li key={index}>{req}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="detail-item">
                                        <h5>For more information/questions, please contact:</h5>
                                        <p>{formattedEvent.contactPerson}<br />
                                        {formattedEvent.contactEmail}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Volunteer positions */}
                            <div className="event-section">
                                <h3>Volunteer positions</h3>
                                <div className="position-card">
                                    <div className="position-header">
                                        <h4>Volunteer</h4>
                                        <span className="slots-remaining">
                                            {formattedEvent.remainingSlots} of {formattedEvent.totalSlots} slots left
                                        </span>
                                    </div>
                                    <div className="position-body">
                                        <p>{formattedEvent.responsibilities[0] || "Help support this event as a volunteer"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* About the organization */}
                            <div className="event-section">
                                <h3>About the organisation</h3>
                                <p>{event.org_description || "Founded in June 2017, Happy Children Happy Future (HCHF) is a initiative committed to transforming the lives of Primary 1 to Secondary 3 students from low-income or single-parent families. Through free tuition, we strive to close the education gap and open doors to brighter opportunities for these deserving children."}</p>
                                
                                <h4>Why Your Support Matters</h4>
                                <p>Every child has the potential to thrive, but many face challenges that stand in their way—limited resources, restricted opportunities, and circumstances beyond their control. These struggles not only impact their academics but also their confidence and future possibilities.</p>
                                
                                <p>At HCHF, we aim to change that story. With your help, we can bridge the educational gap, uplift young minds, and give these children the tools to overcome their hurdles.</p>
                                
                                <h4>Join the Movement—Be Part of the Change</h4>
                                <p>As a volunteer, you're not just teaching; you're inspiring confidence, shaping futures, and building a better society for us all. Your time could be the catalyst that turns struggles into triumphs and dreams into realities.</p>
                                
                                <p className="highlight-quote">✨ Volunteer with HCHF today—because every child deserves the chance to shine. ✨</p>
                            </div>
                        </div>

                        {/* Sidebar with registration */}
                        <div className="event-sidebar">
                            <div className="registration-card">
                                <div className="info-item">
                                    <div className="icon">📍</div>
                                    <div className="content">
                                        <h5>Location</h5>
                                        <p>{formattedEvent.location}</p>
                                    </div>
                                </div>
                                
                                <div className="info-item">
                                    <div className="icon">🗓️</div>
                                    <div className="content">
                                        <h5>Date and time</h5>
                                        <p>{formattedEvent.date}</p>
                                        {formattedEvent.specificDates.length > 0 && (
                                            <ul className="specific-dates">
                                                {formattedEvent.specificDates.map((date, index) => (
                                                    <li key={index}>{date}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                                
                                {isRegistered ? (
                                    <button 
                                        className="btn btn-outline-danger btn-lg w-100" 
                                        onClick={cancelRegistration}
                                    >
                                        Cancel Registration
                                    </button>
                                ) : (
                                    <button 
                                        className="btn btn-primary btn-lg w-100" 
                                        onClick={handleRegisterClick}
                                        disabled={formattedEvent.status !== "active" || formattedEvent.remainingSlots <= 0}
                                    >
                                        {formattedEvent.status !== "active" ? "Event Not Active" : 
                                         formattedEvent.remainingSlots <= 0 ? "No Spots Available" : 
                                         "I want to volunteer"}
                                    </button>
                                )}
                                
                                <div className="slots-info">
                                    <p>
                                        <strong>{formattedEvent.remainingSlots}</strong> of <strong>{formattedEvent.totalSlots}</strong> spots left
                                    </p>
                                    <div className="progress">
                                        <div 
                                            className="progress-bar" 
                                            role="progressbar" 
                                            style={{ 
                                                width: `${((formattedEvent.totalSlots - formattedEvent.remainingSlots) / formattedEvent.totalSlots) * 100}%` 
                                            }} 
                                            aria-valuenow={formattedEvent.totalSlots - formattedEvent.remainingSlots} 
                                            aria-valuemin="0" 
                                            aria-valuemax={formattedEvent.totalSlots}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>{isRegistered ? "Cancel Registration" : "Confirm Registration"}</h3>
                            <button className="close-btn" onClick={() => setShowConfirmModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            {isRegistered ? (
                                <p>Are you sure you want to cancel your registration for this event? This action cannot be undone.</p>
                            ) : (
                                <>
                                    <p>You are about to register as a volunteer for:</p>
                                    <p><strong>{formattedEvent.title}</strong></p>
                                    <p>Please ensure you can commit to the following:</p>
                                    <ul>
                                        {formattedEvent.requirements.length > 0 ? (
                                            formattedEvent.requirements.map((req, index) => (
                                                <li key={index}>{req}</li>
                                            ))
                                        ) : (
                                            <li>Attending at the specified date and time</li>
                                        )}
                                    </ul>
                                </>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                            {isRegistered ? (
                                <button className="btn btn-danger" onClick={confirmCancellation}>Confirm Cancellation</button>
                            ) : (
                                <button className="btn btn-primary" onClick={confirmRegistration}>Confirm Registration</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EventDetail;