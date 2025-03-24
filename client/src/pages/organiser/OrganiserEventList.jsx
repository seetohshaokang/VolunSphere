import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Dropdown, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, Calendar } from 'lucide-react';
import Navbar from '../../layout/Navbar';
import OrganiserSidebar from '../../layout/OrganiserSidebar';

const OrganiserEventsPage = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOption, setFilterOption] = useState('all');

    const navigate = useNavigate();

    // Fetch organiser's events
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                // Get the JWT token from localStorage (FOR ACTUAL DEPLOYMENT)
                //     const token = localStorage.getItem('token');

                //     if (!token) {
                //         navigate('/login');
                //         return;
                //     }

                //     const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/events/organiser`, {
                //         headers: {
                //             Authorization: `Bearer ${token}`
                //         }
                //     });

                //     setEvents(response.data);
                //     setFilteredEvents(response.data);
                //     setLoading(false);
                // } catch (err) {
                //     setError('Failed to load events. Please try again later.');
                //     setLoading(false);
                //     console.error('Error fetching events:', err);
                // }

                // Mock data for UI testing
                const mockEvents = [
                    {
                        id: 1,
                        title: "Community Clean-up",
                        description: "Join us for a day of community service cleaning up local parks.",
                        date: new Date(Date.now() + 86400000 * 3), // 3 days from now
                        location: "Central Park",
                        attendees_count: 12,
                        image_url: "https://via.placeholder.com/300x180"
                    },
                    {
                        id: 2,
                        title: "Food Drive",
                        description: "Help collect non-perishable food items for local food banks.",
                        date: new Date(Date.now() - 86400000 * 2), // 2 days ago
                        location: "Community Center",
                        attendees_count: 24,
                        image_url: null
                    },
                    {
                        id: 3,
                        title: "Charity Marathon",
                        description: "Annual 5k run to raise funds for children's hospital.",
                        date: new Date(Date.now() + 86400000 * 10), // 10 days from now
                        location: "Downtown",
                        attendees_count: 156,
                        image_url: "https://via.placeholder.com/300x180"
                    },
                    {
                        id: 4,
                        title: "Blood Donation Camp",
                        description: "Emergency blood donation drive for local hospitals.",
                        date: new Date(), // Today
                        location: "City Hall",
                        attendees_count: 45,
                        image_url: null
                    },
                    {
                        id: 5,
                        title: "Tree Planting Initiative",
                        description: "Help us plant 500 trees in the city's green belt.",
                        date: new Date(Date.now() + 86400000 * 5), // 5 days from now
                        location: "Green Park",
                        attendees_count: 67,
                        image_url: "https://via.placeholder.com/300x180"
                    },
                    {
                        id: 6,
                        title: "Senior Citizens Support",
                        description: "Volunteer to assist seniors with technology and daily tasks.",
                        date: new Date(Date.now() - 86400000 * 5), // 5 days ago
                        location: "Retirement Home",
                        attendees_count: 18,
                        image_url: null
                    }
                ];

                setEvents(mockEvents);
                setFilteredEvents(mockEvents);
                setLoading(false);
            } catch (err) {
                setError('Failed to load events. Please try again later.');
                setLoading(false);
                console.error('Error loading mock events:', err);
            }
        };

        fetchEvents();
    }, [navigate]);

    // Filter and search events
    useEffect(() => {
        let result = [...events];

        // Apply filter
        if (filterOption !== 'all') {
            const today = new Date();

            switch (filterOption) {
                case 'upcoming':
                    result = result.filter(event => new Date(event.date) > today);
                    break;
                case 'past':
                    result = result.filter(event => new Date(event.date) < today);
                    break;
                case 'today':
                    result = result.filter(event => {
                        const eventDate = new Date(event.date);
                        return eventDate.getDate() === today.getDate() &&
                            eventDate.getMonth() === today.getMonth() &&
                            eventDate.getFullYear() === today.getFullYear();
                    });
                    break;
                case 'thisWeek':
                    const endOfWeek = new Date();
                    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
                    result = result.filter(event => {
                        const eventDate = new Date(event.date);
                        return eventDate >= today && eventDate <= endOfWeek;
                    });
                    break;
                case 'thisMonth':
                    result = result.filter(event => {
                        const eventDate = new Date(event.date);
                        return eventDate.getMonth() === today.getMonth() &&
                            eventDate.getFullYear() === today.getFullYear();
                    });
                    break;
                default:
                    break;
            }
        }

        // Apply search
        if (searchTerm) {
            const lowercaseSearch = searchTerm.toLowerCase();
            result = result.filter(event =>
                event.title.toLowerCase().includes(lowercaseSearch) ||
                event.description.toLowerCase().includes(lowercaseSearch) ||
                event.location.toLowerCase().includes(lowercaseSearch)
            );
        }

        setFilteredEvents(result);
    }, [events, filterOption, searchTerm]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (option) => {
        setFilterOption(option);
    };

    const handleEventClick = (eventId) => {
        navigate(`/event/${eventId}`);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Main content style with padding for floating sidebar
    const mainContentStyle = {
        paddingLeft: '80px', // Space for collapsed sidebar
        transition: 'padding-left 0.3s ease',
        padding: '20px 20px 20px 80px'
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <OrganiserSidebar />
                <div style={{ marginTop: '60px' }}>
                    <div style={mainContentStyle}>
                        <Container className="text-center mt-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </Container>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <OrganiserSidebar />
                <div style={{ marginTop: '60px' }}>
                    <div style={mainContentStyle}>
                        <Container className="text-center mt-5">
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        </Container>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <OrganiserSidebar />
            <div style={{ marginTop: '60px' }}>
                <div style={mainContentStyle}>
                    <Container fluid>
                        <Row className="mb-4">
                            <Col>
                                <h1 className="mb-4">My Events</h1>
                                <p>Manage and view all your events</p>
                            </Col>
                            <Col md="auto" className="d-flex align-items-center">
                                <Button
                                    variant="primary"
                                    onClick={() => navigate('/create-event')}
                                    className="d-flex align-items-center"
                                >
                                    <Calendar className="me-2" size={18} />
                                    Create New Event
                                </Button>
                            </Col>
                        </Row>

                        <Row className="mb-4">
                            <Col md={8}>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <Search size={18} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        placeholder="Search events by title, description, or location..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={4}>
                                <Dropdown>
                                    <Dropdown.Toggle variant="outline-secondary" className="w-100 d-flex align-items-center justify-content-between">
                                        <span>
                                            <Filter className="me-2" size={18} />
                                            {filterOption === 'all' && 'All Events'}
                                            {filterOption === 'upcoming' && 'Upcoming Events'}
                                            {filterOption === 'past' && 'Past Events'}
                                            {filterOption === 'today' && 'Today\'s Events'}
                                            {filterOption === 'thisWeek' && 'This Week'}
                                            {filterOption === 'thisMonth' && 'This Month'}
                                        </span>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={() => handleFilterChange('all')}>All Events</Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleFilterChange('upcoming')}>Upcoming Events</Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleFilterChange('past')}>Past Events</Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleFilterChange('today')}>Today's Events</Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleFilterChange('thisWeek')}>This Week</Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleFilterChange('thisMonth')}>This Month</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Col>
                        </Row>

                        {filteredEvents.length === 0 ? (
                            <div className="text-center py-5">
                                <h4>No events found</h4>
                                <p className="text-muted">
                                    {searchTerm
                                        ? "Try adjusting your search terms or filters"
                                        : "Create your first event by clicking the 'Create New Event' button"}
                                </p>
                            </div>
                        ) : (
                            <Row xs={1} md={2} lg={3} className="g-4">
                                {filteredEvents.map(event => (
                                    <Col key={event.id}>
                                        <Card
                                            className="h-100 shadow-sm hover-shadow border-0"
                                            style={{ cursor: 'pointer', transition: 'transform 0.3s, box-shadow 0.3s' }}
                                            onClick={() => handleEventClick(event.id)}
                                        >
                                            {event.image_url ? (
                                                <Card.Img
                                                    variant="top"
                                                    src={event.image_url}
                                                    alt={event.title}
                                                    style={{ height: '180px', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div
                                                    className="bg-light d-flex justify-content-center align-items-center"
                                                    style={{ height: '180px' }}
                                                >
                                                    <Calendar size={50} className="text-secondary" />
                                                </div>
                                            )}
                                            <Card.Body>
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <Card.Title>{event.title}</Card.Title>
                                                    <span className={`badge ${new Date(event.date) < new Date() ? 'bg-secondary' : 'bg-primary'}`}>
                                                        {new Date(event.date) < new Date() ? 'Past' : 'Upcoming'}
                                                    </span>
                                                </div>
                                                <Card.Text as="div">
                                                    <div className="text-muted mb-2">
                                                        <strong>Date:</strong> {formatDate(event.date)}
                                                    </div>
                                                    <div className="text-muted mb-2">
                                                        <strong>Location:</strong> {event.location}
                                                    </div>
                                                    <div className="text-muted mb-2">
                                                        <strong>Attendees:</strong> {event.attendees_count || 0}
                                                    </div>
                                                    <div className="mb-2" style={{
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical'
                                                    }}>
                                                        {event.description}
                                                    </div>
                                                </Card.Text>
                                            </Card.Body>
                                            <Card.Footer className="bg-white border-top-0">
                                                <div className="d-flex justify-content-end">
                                                    <Button variant="outline-primary" size="sm">
                                                        View Details
                                                    </Button>
                                                </div>
                                            </Card.Footer>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </Container>
                </div>
            </div>
        </>
    );
};

export default OrganiserEventsPage;