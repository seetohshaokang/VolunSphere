import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import OrganiserSidebar from '../../layout/OrganiserSidebar';
import Navbar from '../../layout/Navbar';

const OrganiserDashboard = () => {
    // Mock data
    const stats = {
        totalEvents: 12,
        upcomingEvents: 5,
        totalAttendees: 537,
        volunteersManaged: 48,
        completedEvents: 7,
        averageRating: 4.8
    };

    const recentEvents = [
        { id: 1, name: "Beach Clean-up", date: "2025-03-21", attendees: 45, status: "Completed" },
        { id: 2, name: "Food Distribution", date: "2025-03-22", attendees: 32, status: "Completed" },
        { id: 3, name: "Marathon Fundraiser", date: "2025-03-30", attendees: 210, status: "Upcoming" }
    ];

    // Main content style to accommodate sidebar
    const mainContentStyle = {
        marginLeft: '240px', // Match sidebar width
        transition: 'margin-left 0.3s ease',
        padding: '20px'
    };

    return (
        <>
            <Navbar />
            <div style={{ display: 'flex', marginTop: '60px' }}>
                <OrganiserSidebar />

                <div style={mainContentStyle}>
                    <Container fluid>
                        <Row className="mb-4">
                            <Col>
                                <h1 style={{
                                    fontSize: '2.25rem',
                                    fontWeight: '600',
                                    marginBottom: '0.5rem'
                                }}>
                                    Dashboard
                                </h1>
                                <p style={{ color: '#6c757d' }}>Overview of your events and impact</p>
                            </Col>
                        </Row>

                        {/* Stats Cards */}
                        <Row className="mb-4">
                            <Col md={3}>
                                <Card style={{
                                    border: 'none',
                                    borderRadius: '10px',
                                    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
                                    height: '100%'
                                }}>
                                    <Card.Body>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div style={{
                                                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                                                borderRadius: '8px',
                                                padding: '10px',
                                                marginRight: '12px'
                                            }}>
                                                <Calendar size={24} color="#0d6efd" />
                                            </div>
                                            <h6 style={{ margin: 0, color: '#6c757d' }}>Total Events</h6>
                                        </div>
                                        <h2 style={{ fontWeight: '700', marginBottom: '0' }}>{stats.totalEvents}</h2>
                                        <p style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0' }}>
                                            {stats.upcomingEvents} upcoming
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={3}>
                                <Card style={{
                                    border: 'none',
                                    borderRadius: '10px',
                                    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
                                    height: '100%'
                                }}>
                                    <Card.Body>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div style={{
                                                backgroundColor: 'rgba(25, 135, 84, 0.1)',
                                                borderRadius: '8px',
                                                padding: '10px',
                                                marginRight: '12px'
                                            }}>
                                                <Users size={24} color="#198754" />
                                            </div>
                                            <h6 style={{ margin: 0, color: '#6c757d' }}>Total Attendees</h6>
                                        </div>
                                        <h2 style={{ fontWeight: '700', marginBottom: '0' }}>{stats.totalAttendees}</h2>
                                        <p style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0' }}>
                                            {stats.volunteersManaged} volunteers managed
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={3}>
                                <Card style={{
                                    border: 'none',
                                    borderRadius: '10px',
                                    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
                                    height: '100%'
                                }}>
                                    <Card.Body>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div style={{
                                                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                                borderRadius: '8px',
                                                padding: '10px',
                                                marginRight: '12px'
                                            }}>
                                                <Clock size={24} color="#dc3545" />
                                            </div>
                                            <h6 style={{ margin: 0, color: '#6c757d' }}>Completed Events</h6>
                                        </div>
                                        <h2 style={{ fontWeight: '700', marginBottom: '0' }}>{stats.completedEvents}</h2>
                                        <p style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0' }}>
                                            Great work!
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={3}>
                                <Card style={{
                                    border: 'none',
                                    borderRadius: '10px',
                                    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
                                    height: '100%'
                                }}>
                                    <Card.Body>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div style={{
                                                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                                                borderRadius: '8px',
                                                padding: '10px',
                                                marginRight: '12px'
                                            }}>
                                                <TrendingUp size={24} color="#ffc107" />
                                            </div>
                                            <h6 style={{ margin: 0, color: '#6c757d' }}>Average Rating</h6>
                                        </div>
                                        <h2 style={{ fontWeight: '700', marginBottom: '0' }}>{stats.averageRating} <small style={{ fontSize: '1rem' }}>/ 5</small></h2>
                                        <p style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0' }}>
                                            From attendee feedback
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Recent Events */}
                        <Row>
                            <Col>
                                <Card style={{
                                    border: 'none',
                                    borderRadius: '10px',
                                    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)'
                                }}>
                                    <Card.Body>
                                        <h5 style={{ fontWeight: '600', marginBottom: '1.25rem' }}>Recent Events</h5>
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ padding: '12px 8px', borderBottom: '1px solid #dee2e6', textAlign: 'left' }}>Event Name</th>
                                                        <th style={{ padding: '12px 8px', borderBottom: '1px solid #dee2e6', textAlign: 'left' }}>Date</th>
                                                        <th style={{ padding: '12px 8px', borderBottom: '1px solid #dee2e6', textAlign: 'left' }}>Attendees</th>
                                                        <th style={{ padding: '12px 8px', borderBottom: '1px solid #dee2e6', textAlign: 'left' }}>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {recentEvents.map(event => (
                                                        <tr key={event.id}>
                                                            <td style={{ padding: '12px 8px', borderBottom: '1px solid #dee2e6' }}>{event.name}</td>
                                                            <td style={{ padding: '12px 8px', borderBottom: '1px solid #dee2e6' }}>
                                                                {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                            </td>
                                                            <td style={{ padding: '12px 8px', borderBottom: '1px solid #dee2e6' }}>{event.attendees}</td>
                                                            <td style={{ padding: '12px 8px', borderBottom: '1px solid #dee2e6' }}>
                                                                <span style={{
                                                                    padding: '4px 8px',
                                                                    borderRadius: '4px',
                                                                    fontSize: '0.75rem',
                                                                    backgroundColor: event.status === 'Completed' ? 'rgba(25, 135, 84, 0.1)' : 'rgba(13, 110, 253, 0.1)',
                                                                    color: event.status === 'Completed' ? '#198754' : '#0d6efd'
                                                                }}>
                                                                    {event.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div style={{
                                            marginTop: '1rem',
                                            display: 'flex',
                                            justifyContent: 'center'
                                        }}>
                                            <a
                                                href="/organiser/event"
                                                style={{
                                                    textDecoration: 'none',
                                                    color: '#0d6efd',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                View all events
                                            </a>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </div>
        </>
    );
};

export default OrganiserDashboard;