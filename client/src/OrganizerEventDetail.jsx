import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { Container, Row, Col, Card, Button, Form, Nav, Table, Badge, Dropdown, Modal, Alert, ProgressBar, Tab, Tabs } from "react-bootstrap";
import { PencilSquare, Download, Calendar, GeoAlt, PeopleFill, CheckCircle, XCircle, Search } from "react-bootstrap-icons";
import './OrganizerEventDetails.css';

function OrganizerEventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [editedEvent, setEditedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("details");

  // Fetch event data
  useEffect(() => {
        // In production, this would be an API call
        // For demo purposes, we're using static data
    setLoading(true);

    // Simulate API call with timeout
    setTimeout(() => {
      const mockEvent = {
        id: parseInt(eventId),
        title: "Community Garden Cleanup Initiative",
        organizer: "Green Earth Association",
        date: "Every Saturday, 9:00 AM - 12:00 PM",
        specificDates: [
          "Sat, Apr 05, 2025",
          "Sat, Apr 12, 2025",
          "Sat, Apr 19, 2025",
        ],
        location: "Community Garden, 123 Green Street",
        category: "Environment",
        tags: ["Environment", "Community service", "Gardening"],
        remainingSlots: 8,
        totalSlots: 25,
        description:
          "Join us in beautifying our community garden! This event focuses on cleaning up garden beds, removing weeds, planting new flowers and vegetables, and maintaining the garden infrastructure.",
        requirements: [
          "No experience necessary - we'll teach you!",
          "Wear comfortable clothes that can get dirty",
          "Bring water and sun protection",
          "Must be able to bend, stoop, and lift up to 10 pounds",
        ],
        responsibilities: [
          "Help with weeding and mulching garden beds",
          "Assist with planting seasonal vegetables and flowers",
          "Participate in general cleanup of the garden area",
          "Help maintain garden tools and equipment",
        ],
        contactPerson: "Maria Chen",
        contactEmail: "maria@greenearth.org",
        imageUrl:
          "/src/assets/tuition-volunteer.jpg",
        status: "active",
      };

      setEvent(mockEvent);
      setEditedEvent(mockEvent);
      setLoading(false);

      // Fetch Participants
      const mockParticipants = [
        {
          id: 1,
          name: "John Smith",
          email: "john.smith@example.com",
          phone: "9123 4567",
          registrationDate: "2025-03-01T09:30:00",
          status: "confirmed",
        },
        {
          id: 2,
          name: "Emily Wong",
          email: "emily.wong@example.com",
          phone: "9876 5432",
          registrationDate: "2025-03-02T14:15:00",
          status: "confirmed",
        },
        {
          id: 3,
          name: "Michael Rodriguez",
          email: "michael.r@example.com",
          phone: "9111 2222",
          registrationDate: "2025-03-04T10:45:00",
          status: "pending",
        },
        {
          id: 4,
          name: "Sarah Johnson",
          email: "sarah.j@example.com",
          phone: "9555 7777",
          registrationDate: "2025-03-05T16:20:00",
          status: "confirmed",
        },
        {
          id: 5,
          name: "David Lee",
          email: "david.lee@example.com",
          phone: "9888 4444",
          registrationDate: "2025-03-07T11:10:00",
          status: "waitlist",
        },
      ];

      setParticipants(mockParticipants);
    }, 800);
  }, [eventId]);

  // Edit Mode
  const toggleEditMode = () => {
    if (isEditing) {
      setEditedEvent(event);
    }
    setIsEditing(!isEditing);
  };

  const handleEditField = (field, value) => {
    setEditedEvent({
      ...editedEvent,
      [field]: value,
    });
  };

  const handleArrayField = (field, index, value) => {
    const newArray = [...editedEvent[field]];
    newArray[index] = value;
    setEditedEvent({
      ...editedEvent,
      [field]: newArray,
    });
  };

  const addArrayItem = (field) => {
    const newArray = [...editedEvent[field], ""];
    setEditedEvent({
      ...editedEvent,
      [field]: newArray,
    });
  };

  const removeArrayItem = (field, index) => {
    const newArray = [...editedEvent[field]];
    newArray.splice(index, 1);
    setEditedEvent({
      ...editedEvent,
      [field]: newArray,
    });
  };

  const saveEventChanges = () => {
    setShowConfirmModal(true);
  };

  const confirmSaveChanges = () => {
    // Would be API call
    setTimeout(() => {
      setEvent(editedEvent);
      setIsEditing(false);
      setShowConfirmModal(false);
      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 800);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const downloadParticipantsCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Registration Date",
      "Status",
    ];
    const csvRows = [
      headers.join(","),
      ...participants.map((p) => {
        return [
          p.id,
          `"${p.name}"`,
          `"${p.email}"`,
          `"${p.phone}"`,
          new Date(p.registrationDate).toLocaleString(),
          p.status,
        ].join(",");
      }),
    ];

    const csvData = csvRows.join("\n");

    //Create download link
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `participants_event_${eventId}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Filter participants based on search and status filter
  const filteredParticipants = participants.filter((participant) => {
    const matchesSearch =
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || participant.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Container className="my-5 pt-5">
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading event details...</p>
        </div>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container className="my-5 pt-5">
        <Alert variant="danger">Event not found or has been removed.</Alert>
      </Container>
    );
  }

  return (
<>
  {/* VolunSphere Header */}
  <nav className="navbar navbar-expand-lg navbar-light fixed-top" style={{ backgroundColor: "#e3f2fd" }}>
    <div className="container">
      <a className="navbar-brand" href="/">VolunSphere</a>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse" 
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav ms-auto">
          <li className="nav-item me-2 mb-2">
            <button className="btn btn-outline-primary" onClick={() => navigate("/login")}>
              Log In
            </button>
          </li>
          <li className="nav-item">
            <button className="btn btn-outline-secondary" onClick={() => navigate("/registration")}>
              Sign Up
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
    
    <Container className="my-4 pt-5">
      {/* Breadcrumb navigation */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/">Dashboard</a>
          </li>
          <li className="breadcrumb-item">
            <a href="/manage-events">My Events</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {event.title}
          </li>
        </ol>
      </nav>

      {/* Event header with edit button */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1>{event.title}</h1>
          <div className="d-flex align-items-center mb-2">
            <div className="org-logo me-2"></div>
            <span>{event.organizer}</span>
          </div>

          <div className="mt-2">
            <Badge
              bg={
                event.status === "active"
                  ? "success"
                  : event.status === "draft"
                  ? "warning"
                  : "secondary"
              }
            >
              {event.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="action-buttons">
          <Button
            variant={isEditing ? "outline-secondary" : "outline-primary"}
            onClick={toggleEditMode}
            className="me-2"
          >
            {isEditing ? (
              "Cancel"
            ) : (
              <>
                <PencilSquare className="me-1" /> Edit
              </>
            )}
          </Button>

          {isEditing && (
            <Button variant="primary" onClick={saveEventChanges}>
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {/* Success message */}
      {saveSuccess && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSaveSuccess(false)}
        >
          Event details have been updated successfully!
        </Alert>
      )}

      {/* Main content with tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
        id="event-management-tabs"
      >
        <Tab eventKey="details" title="Event Details">
          {/* Details content */}
          <Card className="mb-4">
            <Card.Body>
              {isEditing ? (
                /* Edit mode */
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Event Title</Form.Label>
                    <Form.Control
                      type="text"
                      value={editedEvent.title}
                      onChange={(e) => handleEditField("title", e.target.value)}
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Organizer</Form.Label>
                        <Form.Control
                          type="text"
                          value={editedEvent.organizer}
                          onChange={(e) =>
                            handleEditField("organizer", e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>
                        <Form.Select
                          value={editedEvent.category}
                          onChange={(e) =>
                            handleEditField("category", e.target.value)
                          }
                        >
                          <option>Education</option>
                          <option>Environment</option>
                          <option>Health</option>
                          <option>Arts & Culture</option>
                          <option>Animal Welfare</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Schedule</Form.Label>
                    <Form.Control
                      type="text"
                      value={editedEvent.date}
                      onChange={(e) => handleEditField("date", e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Specific Dates</Form.Label>
                    {editedEvent.specificDates.map((date, index) => (
                      <div className="d-flex mb-2" key={index}>
                        <Form.Control
                          type="text"
                          value={date}
                          onChange={(e) =>
                            handleArrayField(
                              "specificDates",
                              index,
                              e.target.value
                            )
                          }
                        />
                        <Button
                          variant="outline-danger"
                          className="ms-2"
                          onClick={() =>
                            removeArrayItem("specificDates", index)
                          }
                        >
                          <XCircle />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => addArrayItem("specificDates")}
                    >
                      + Add Date
                    </Button>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      value={editedEvent.location}
                      onChange={(e) =>
                        handleEditField("location", e.target.value)
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={editedEvent.description}
                      onChange={(e) =>
                        handleEditField("description", e.target.value)
                      }
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Total Available Slots</Form.Label>
                        <Form.Control
                          type="number"
                          value={editedEvent.totalSlots}
                          onChange={(e) =>
                            handleEditField(
                              "totalSlots",
                              parseInt(e.target.value)
                            )
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Remaining Slots</Form.Label>
                        <Form.Control
                          type="number"
                          value={editedEvent.remainingSlots}
                          onChange={(e) =>
                            handleEditField(
                              "remainingSlots",
                              parseInt(e.target.value)
                            )
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Tags</Form.Label>
                    {editedEvent.tags.map((tag, index) => (
                      <div className="d-flex mb-2" key={index}>
                        <Form.Control
                          type="text"
                          value={tag}
                          onChange={(e) =>
                            handleArrayField("tags", index, e.target.value)
                          }
                        />
                        <Button
                          variant="outline-danger"
                          className="ms-2"
                          onClick={() => removeArrayItem("tags", index)}
                        >
                          <XCircle />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => addArrayItem("tags")}
                    >
                      + Add Tag
                    </Button>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Requirements</Form.Label>
                    {editedEvent.requirements.map((requirement, index) => (
                      <div className="d-flex mb-2" key={index}>
                        <Form.Control
                          type="text"
                          value={requirement}
                          onChange={(e) =>
                            handleArrayField(
                              "requirements",
                              index,
                              e.target.value
                            )
                          }
                        />
                        <Button
                          variant="outline-danger"
                          className="ms-2"
                          onClick={() => removeArrayItem("requirements", index)}
                        >
                          <XCircle />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => addArrayItem("requirements")}
                    >
                      + Add Requirement
                    </Button>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Responsibilities</Form.Label>
                    {editedEvent.responsibilities.map(
                      (responsibility, index) => (
                        <div className="d-flex mb-2" key={index}>
                          <Form.Control
                            type="text"
                            value={responsibility}
                            onChange={(e) =>
                              handleArrayField(
                                "responsibilities",
                                index,
                                e.target.value
                              )
                            }
                          />
                          <Button
                            variant="outline-danger"
                            className="ms-2"
                            onClick={() =>
                              removeArrayItem("responsibilities", index)
                            }
                          >
                            <XCircle />
                          </Button>
                        </div>
                      )
                    )}
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => addArrayItem("responsibilities")}
                    >
                      + Add Responsibility
                    </Button>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Contact Person</Form.Label>
                        <Form.Control
                          type="text"
                          value={editedEvent.contactPerson}
                          onChange={(e) =>
                            handleEditField("contactPerson", e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Contact Email</Form.Label>
                        <Form.Control
                          type="email"
                          value={editedEvent.contactEmail}
                          onChange={(e) =>
                            handleEditField("contactEmail", e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Event Status</Form.Label>
                    <Form.Select
                      value={editedEvent.status}
                      onChange={(e) =>
                        handleEditField("status", e.target.value)
                      }
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                  </Form.Group>
                </Form>
              ) : (
                /* View mode */
                <>
                  {/* Banner image */}
                  <div className="event-banner mb-4">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="img-fluid rounded"
                      style={{
                        maxHeight: "300px",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  {/* Event key information */}
                  <div className="p-3 bg-light rounded mb-4">
                    <Row>
                      <Col md={4} className="mb-3">
                        <div className="d-flex align-items-center">
                          <Calendar className="text-primary me-2" size={20} />
                          <div>
                            <h6 className="mb-1">Schedule</h6>
                            <p className="mb-0">{event.date}</p>
                          </div>
                        </div>
                      </Col>
                      <Col md={4} className="mb-3">
                        <div className="d-flex align-items-center">
                          <GeoAlt className="text-primary me-2" size={20} />
                          <div>
                            <h6 className="mb-1">Location</h6>
                            <p className="mb-0">{event.location}</p>
                          </div>
                        </div>
                      </Col>
                      <Col md={4} className="mb-3">
                        <div className="d-flex align-items-center">
                          <PeopleFill className="text-primary me-2" size={20} />
                          <div>
                            <h6 className="mb-1">Registrations</h6>
                            <p className="mb-0">
                              {event.totalSlots - event.remainingSlots} of{" "}
                              {event.totalSlots} spots filled
                            </p>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Tags */}
                  <div className="mb-4">
                    <h5>Tags</h5>
                    <div className="d-flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="badge bg-info text-dark rounded-pill px-3 py-2"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <h5>Description</h5>
                    <p>{event.description}</p>
                  </div>

                  {/* Specific dates */}
                  <div className="mb-4">
                    <h5>Event Dates</h5>
                    <p>{event.date}</p>
                    <ul className="list-unstyled">
                      {event.specificDates.map((date, index) => (
                        <li key={index} className="mb-1">
                          • {date}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Requirements */}
                  <div className="mb-4">
                    <h5>Volunteer Requirements</h5>
                    <ul>
                      {event.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Responsibilities */}
                  <div className="mb-4">
                    <h5>Volunteer Responsibilities</h5>
                    <ul>
                      {event.responsibilities.map((resp, index) => (
                        <li key={index}>{resp}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Contact Info */}
                  <div className="mb-4">
                    <h5>Contact Information</h5>
                    <p>
                      <strong>Contact Person:</strong> {event.contactPerson}
                      <br />
                      <strong>Email:</strong> {event.contactEmail}
                    </p>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="participants" title="Participants">
          {/* Participants list */}
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">Registered Participants</h5>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={downloadParticipantsCSV}
                >
                  <Download className="me-1" /> Export CSV
                </Button>
              </div>

              {/* Search and filters */}
              <Row className="mb-4">
                <Col md={6} className="mb-3 mb-md-0">
                  <div className="input-group">
                    <span className="input-group-text">
                      <Search />
                    </span>
                    <Form.Control
                      type="text"
                      placeholder="Search by name, email or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-center">
                    <span className="me-2">Status:</span>
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{ maxWidth: "200px" }}
                    >
                      <option value="all">All</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="waitlist">Waitlist</option>
                    </Form.Select>
                  </div>
                </Col>
              </Row>

              {/* Participants count and table */}
              <p className="text-muted">
                Showing {filteredParticipants.length} of {participants.length}{" "}
                participants
              </p>

              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Registration Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParticipants.length > 0 ? (
                      filteredParticipants.map((participant) => (
                        <tr key={participant.id}>
                          <td>{participant.name}</td>
                          <td>{participant.email}</td>
                          <td>{participant.phone}</td>
                          <td>{formatDate(participant.registrationDate)}</td>
                          <td>
                            <Badge
                              bg={
                                participant.status === "confirmed"
                                  ? "success"
                                  : participant.status === "pending"
                                  ? "warning"
                                  : "secondary"
                              }
                            >
                              {participant.status}
                            </Badge>
                          </td>
                          <td>
                            <Dropdown>
                              <Dropdown.Toggle
                                variant="link"
                                size="sm"
                                id={`dropdown-${participant.id}`}
                              >
                                Actions
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item
                                  href={`mailto:${participant.email}`}
                                >
                                  Email Participant
                                </Dropdown.Item>
                                <Dropdown.Item>View Profile</Dropdown.Item>
                                <Dropdown.Divider />
                                {participant.status !== "confirmed" && (
                                  <Dropdown.Item className="text-success">
                                    <CheckCircle className="me-1" /> Confirm
                                  </Dropdown.Item>
                                )}
                                {participant.status !== "waitlist" && (
                                  <Dropdown.Item className="text-warning">
                                    Move to Waitlist
                                  </Dropdown.Item>
                                )}
                                <Dropdown.Item className="text-danger">
                                  <XCircle className="me-1" /> Remove
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          No participants match your search criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="stats" title="Analytics">
          {/* Analytics and Statistics */}
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-4">Event Statistics</h5>

              <Row>
                <Col md={4} className="mb-4">
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body className="text-center">
                      <h6 className="card-title">Registration Rate</h6>
                      <div className="display-4 fw-bold text-primary mb-2">
                        {Math.round(
                          ((event.totalSlots - event.remainingSlots) /
                            event.totalSlots) *
                            100
                        )}
                        %
                      </div>
                      <p className="text-muted">
                        {event.totalSlots - event.remainingSlots} of{" "}
                        {event.totalSlots} slots filled
                      </p>
                      <ProgressBar
                        now={
                          ((event.totalSlots - event.remainingSlots) /
                            event.totalSlots) *
                          100
                        }
                        className="mt-2"
                      />
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4} className="mb-4">
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body className="text-center">
                      <h6 className="card-title">Status Distribution</h6>
                      <div className="mt-3">
                        <div className="d-flex justify-content-between mb-2">
                          <span>Confirmed</span>
                          <span className="fw-bold">
                            {
                              participants.filter(
                                (p) => p.status === "confirmed"
                              ).length
                            }
                          </span>
                        </div>
                        <ProgressBar
                          variant="success"
                          now={
                            (participants.filter(
                              (p) => p.status === "confirmed"
                            ).length /
                              participants.length) *
                            100
                          }
                          className="mb-3"
                        />
                        <div className="d-flex justify-content-between mb-2">
                          <span>Pending</span>
                          <span className="fw-bold">
                            {
                              participants.filter((p) => p.status === "pending")
                                .length
                            }
                          </span>
                        </div>
                        <ProgressBar
                          variant="warning"
                          now={
                            (participants.filter((p) => p.status === "pending")
                              .length /
                              participants.length) *
                            100
                          }
                          className="mb-3"
                        />

                        <div className="d-flex justify-content-between mb-2">
                          <span>Waitlist</span>
                          <span className="fw-bold">
                            {
                              participants.filter(
                                (p) => p.status === "waitlist"
                              ).length
                            }
                          </span>
                        </div>
                        <ProgressBar
                          variant="secondary"
                          now={
                            (participants.filter((p) => p.status === "waitlist")
                              .length /
                              participants.length) *
                            100
                          }
                        />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4} className="mb-4">
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body className="text-center">
                      <h6 className="card-title">Registration Timeline</h6>
                      <div className="mt-3">
                        <div className="text-muted mb-2">
                          Latest registration:
                        </div>
                        <div className="fw-bold mb-3">
                          {formatDate(
                            participants.sort(
                              (a, b) =>
                                new Date(b.registrationDate) -
                                new Date(a.registrationDate)
                            )[0].registrationDate
                          )}
                        </div>
                        <div className="text-muted mb-2">
                          First registration:
                        </div>
                        <div className="fw-bold">
                          {formatDate(
                            participants.sort(
                              (a, b) =>
                                new Date(a.registrationDate) -
                                new Date(b.registrationDate)
                            )[0].registrationDate
                          )}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                  <h6 className="card-title mb-3">Registration Activity</h6>
                  <div className="text-center p-5 bg-light rounded">
                    <p className="mb-1">Chart visualization would go here</p>
                    <small className="text-muted">
                      This area would display a chart showing registrations over
                      time. You can implement this with Chart.js or Recharts.
                    </small>
                  </div>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h6 className="card-title mb-3">Engagement Metrics</h6>
                  <Row>
                    <Col md={3} className="text-center mb-3 mb-md-0">
                      <div className="h2 mb-1 text-primary">14</div>
                      <div className="text-muted small">Page Views</div>
                    </Col>
                    <Col md={3} className="text-center mb-3 mb-md-0">
                      <div className="h2 mb-1 text-primary">8</div>
                      <div className="text-muted small">
                        Applications Started
                      </div>
                    </Col>
                    <Col md={3} className="text-center mb-3 mb-md-0">
                      <div className="h2 mb-1 text-primary">62%</div>
                      <div className="text-muted small">Completion Rate</div>
                    </Col>
                    <Col md={3} className="text-center">
                      <div className="h2 mb-1 text-primary">3</div>
                      <div className="text-muted small">Shares</div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="messages" title="Messages">
          {/* Messages to Participants */}
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-4">Message Participants</h5>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Recipients</Form.Label>
                  <Form.Select>
                    <option value="all">All Participants</option>
                    <option value="confirmed">Confirmed Participants</option>
                    <option value="pending">Pending Participants</option>
                    <option value="waitlist">Waitlist Participants</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control type="text" placeholder="Email subject" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    placeholder="Type your message here..."
                  />
                  <Form.Text className="text-muted">
                    You can use {"{name}"} to include the recipient's name in
                    your message.
                  </Form.Text>
                </Form.Group>

                <div className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="send-copy"
                    label="Send a copy to myself"
                  />
                </div>

                <Button variant="primary">Send Message</Button>
              </Form>

              <hr className="my-4" />

              <h5 className="mb-3">Message History</h5>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Subject</th>
                      <th>Recipients</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Mar 10, 2025</td>
                      <td>Important Update: Location Change</td>
                      <td>All Participants (5)</td>
                      <td>
                        <Button variant="link" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td>Mar 05, 2025</td>
                      <td>Welcome to our Garden Cleanup Event!</td>
                      <td>Confirmed Participants (3)</td>
                      <td>
                        <Button variant="link" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Changes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to save the changes to this event? This will
          update the information shown to volunteers.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
    </>
  );
}

export default OrganizerEventDetail;
