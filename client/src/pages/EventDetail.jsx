import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Navbar from './Navbar';
import './EventDetail.css';

function EventDetail() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRegistered, setIsRegistered] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    // Fetch event details
    useEffect(() => {
        // In production, this would be an API call
        // For demo purposes, we're using static data
        setLoading(true);
        
        // Simulate API call with timeout
        setTimeout(() => {
            // Mock event data based on ID
            const mockEvent = {
                id: parseInt(eventId),
                title: "Tuition - Recruiting Volunteer Tutors At HCHF Hougang",
                organizer: "Happy Children Happy Future",
                date: "Every Wed 7:30 PM - 9:00 PM",
                specificDates: ["Wed, Apr 03, 2025", "Wed, Oct 29, 2025"],
                location: "BLK 414 HOUGANG AVENUE 8, Singapore 538440",
                category: "Education",
                tags: ["Community development", "Social service and welfare"],
                remainingSlots: 3,
                totalSlots: 4,
                description: "Happy Children Happy Future (HCHF) is fully managed and run by volunteers. We provide free programmes to underprivileged students from either low-income or single-parent families.",
                requirements: [
                    "Enjoy working with children",
                    "Relevant qualifications to teach O/N levels",
                    "Able to commit for at least 3 months",
                    "Able to attend 4 out of 4 sessions per month"
                ],
                responsibilities: [
                    "The key responsibility of a volunteer tutor is to provide academic help to the best of your abilities and answer any homework queries from your tutee"
                ],
                contactPerson: "Celin",
                contactEmail: "hchfhougang@gmail.com",
                imageUrl: "/src/assets/tuition-volunteer.jpg"
            };
            
            setEvent(mockEvent);
            setLoading(false);
        }, 800);
    }, [eventId]);

    // Check if user is already registered
    useEffect(() => {
        if (user && event) {
            // In production, check against user registrations in database
            // For demo, we'll just use a random value
            setIsRegistered(Math.random() > 0.7);
        }
    }, [user, event]);

    const handleRegisterClick = () => {
        if (!user) {
            // Redirect to login if not logged in
            navigate('/login', { state: { from: `/event/${eventId}` } });
            return;
        }
        
        // Show confirmation modal
        setShowConfirmModal(true);
    };

    const confirmRegistration = () => {
        // In production, this would be an API call to register
        // For demo, we'll simulate with timeout
        
        setTimeout(() => {
            setIsRegistered(true);
            setShowConfirmModal(false);
            setRegistrationSuccess(true);
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                setRegistrationSuccess(false);
            }, 3000);
        }, 1000);
    };

    const cancelRegistration = () => {
        // In production, this would be an API call to unregister
        // For demo, we'll simulate with timeout
        
        setShowConfirmModal(true);
    };

    const confirmCancellation = () => {
        setTimeout(() => {
            setIsRegistered(false);
            setShowConfirmModal(false);
        }, 1000);
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
                            <li className="breadcrumb-item active" aria-current="page">{event.title}</li>
                        </ol>
                    </nav>
                </div>

                {/* Event header */}
                <div className="event-header">
                    <h1>{event.title}</h1>
                    <div className="organizer-badge">
                        <img src="/src/assets/org-logo.svg" alt="Organization logo" className="org-logo" />
                        <span>{event.organizer}</span>
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
                                <img src={event.imageUrl || "/src/assets/event-placeholder.jpg"} alt={event.title} className="event-image" />
                            </div>

                            {/* Cause tags */}
                            <div className="event-causes">
                                <h5>Supported causes</h5>
                                <div className="causes-tags">
                                    {event.tags.map((tag, index) => (
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
                                <p>{event.description}</p>

                                <div className="event-details">
                                    <div className="detail-item">
                                        <h5>Day and time of sessions</h5>
                                        <p>{event.date}</p>
                                        <ul className="specific-dates">
                                            {event.specificDates.map((date, index) => (
                                                <li key={index}>{date}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="detail-item">
                                        <h5>Location</h5>
                                        <p>{event.location}</p>
                                    </div>

                                    <div className="detail-item">
                                        <h5>Basic requirements</h5>
                                        <ul>
                                            {event.requirements.map((req, index) => (
                                                <li key={index}>{req}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="detail-item">
                                        <h5>For more information/questions, please contact:</h5>
                                        <p>{event.contactPerson}<br />
                                        {event.contactEmail}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Volunteer positions */}
                            <div className="event-section">
                                <h3>Volunteer positions</h3>
                                <div className="position-card">
                                    <div className="position-header">
                                        <h4>Mentor</h4>
                                        <span className="slots-remaining">{event.remainingSlots} of {event.totalSlots} slots left</span>
                                    </div>
                                    <div className="position-body">
                                        <p>{event.responsibilities[0]}</p>
                                    </div>
                                </div>
                            </div>

                            {/* About the organization */}
                            <div className="event-section">
                                <h3>About the organisation</h3>
                                <p>Founded in June 2017, Happy Children Happy Future (HCHF) is a initiative committed to transforming the lives of Primary 1 to Secondary 3 students from low-income or single-parent families. Through free tuition, we strive to close the education gap and open doors to brighter opportunities for these deserving children.</p>
                                
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
                                        <p>{event.location}</p>
                                    </div>
                                </div>
                                
                                <div className="info-item">
                                    <div className="icon">🗓️</div>
                                    <div className="content">
                                        <h5>Date and time</h5>
                                        <p>{event.date}</p>
                                        <ul className="specific-dates">
                                            {event.specificDates.map((date, index) => (
                                                <li key={index}>{date}</li>
                                            ))}
                                        </ul>
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
                                    >
                                        I want to volunteer
                                    </button>
                                )}
                                
                                <div className="slots-info">
                                    <p><strong>{event.remainingSlots}</strong> of <strong>{event.totalSlots}</strong> spots left</p>
                                    <div className="progress">
                                        <div 
                                            className="progress-bar" 
                                            role="progressbar" 
                                            style={{ width: `${((event.totalSlots - event.remainingSlots) / event.totalSlots) * 100}%` }} 
                                            aria-valuenow={event.totalSlots - event.remainingSlots} 
                                            aria-valuemin="0" 
                                            aria-valuemax={event.totalSlots}
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
                                    <p><strong>{event.title}</strong></p>
                                    <p>Please ensure you can commit to the following:</p>
                                    <ul>
                                        {event.requirements.map((req, index) => (
                                            <li key={index}>{req}</li>
                                        ))}
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