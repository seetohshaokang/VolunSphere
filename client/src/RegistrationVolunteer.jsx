import axios from "axios";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./RegistrationVolunteer.module.css";
import { Modal, Button } from "react-bootstrap"; // Bootstrap Validation

function RegistrationVolunteer() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    terms: false,
  });

  // Get the API URL from environment variables
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log(`URL is : ${apiUrl}`); // Fixed `console.log` syntax

  // Function to fetch data from the backend
  const fetchData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/test-connection`); // Fixed template literal
      console.log("Full Response", response); // Log response from backend

      if (response.data) {
        const { message, data } = response.data;
        console.log(message, data);
        setMessage(message);
        setError("");
      } else {
        setError("No data returned from backend");
        setMessage("");
      }
    } catch (err) {
      console.error("Error fetching data from the backend:", err);
      setError("Failed to connect to the backend.");
      setMessage(""); 
    }
  };

  // Call the fetchData function when the component mounts
  useEffect(() => {
    fetchData();
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [modalMessages, setModalMessages] = useState([]); // Store validation errors

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateForm = () => {
    let errors = [];
    if (!formData.firstName) errors.push("First name is required.");
    if (!formData.lastName) errors.push("Last name is required.");
    if (!formData.email) errors.push("Email is required.");
    if (!formData.phone) errors.push("Phone number is required.");
    if (!formData.dateOfBirth) errors.push("Date of Birth is required.");
    if (!formData.password) errors.push("Password is required.");
    if (!formData.terms) errors.push("You must agree to the terms and conditions.");
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      setModalMessages(validationErrors);
      setShowModal(true);
    } else {
      setModalMessages(["Registration Successful!"]);
      setShowModal(true);
    }
  };

  return (
    <div className={`container-fluid ${styles.wrapper}`}>
      <div className="row vh-100">
        {/* Company Description */}
        <div
          className={`col-12 col-md-6 d-flex flex-column justify-content-center align-items-center text-white text-center p-5 ${styles.bgPrimary}`}
        >
          <h1 className="fw-bold">VolunSphere</h1>
          <p className="mt-3">
            We connect passionate individuals with meaningful volunteer
            opportunities.
          </p>
          <p>
            Make an impact, give back, and be part of a community that cares.
          </p>
          <p>Join us in creating positive change—one volunteer at a time.</p>
        </div>

        {/* Registration Info Input */}
        <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
          <div className={`card p-4 shadow ${styles.formContainer}`}>
            <h3 className="text-center">Registration</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">First Name *</label>
                <input type="text" name="firstName" className="form-control" placeholder="First Name" value={formData.firstName} onChange={handleChange} />
              </div>

              <div className="mb-3">
                <label className="form-label">Last Name *</label>
                <input type="text" name="lastName" className="form-control" placeholder="Last Name" value={formData.lastName} onChange={handleChange} />
              </div>

              <div className="mb-3">
                <label className="form-label">Email *</label>
                <input type="email" name="email" className="form-control" placeholder="name@example.com" value={formData.email} onChange={handleChange} />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Phone Number *</label>
                <input type="tel" name="phone" className="form-control" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Date of Birth *</label>
                <input type="date" name="dateOfBirth" className="form-control" value={formData.dateOfBirth} onChange={handleChange} />
              </div>

              <div className="mb-3">
                <label className="form-label">Password *</label>
                <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} />
              </div>

              <div className="mb-3 form-check">
                <input type="checkbox" name="terms" className="form-check-input" id="terms" checked={formData.terms} onChange={handleChange} />
                <label className="form-check-label" htmlFor="terms">I agree to the <a href="#" className="text-primary">terms and conditions</a></label>
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Sign up
              </button>
            </form>

            <p className="text-center mt-3">
              Already have an account?{" "}
              <a href="#" className="text-primary">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* BootStrap Validations */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Body className="text-center">
          {modalMessages.length > 1 ? (
            <>
              <h5 className="text-danger">
                Please fill out the following fields:
              </h5>
              <ul className="text-start">
                {modalMessages.map((msg, index) => (
                  <li key={index} className="text-danger">
                    {msg}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <h5 className="text-success">{modalMessages[0]}</h5>
          )}
          <Button variant="primary" onClick={() => setShowModal(false)}>
            OK
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default RegistrationVolunteer;
