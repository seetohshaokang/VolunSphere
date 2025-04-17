// src/containers/Auth/RegistrationOrganiser/index.jsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Api from "@/helpers/Api";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

function RegistrationOrganiser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    website: "",
    description: "",
    terms: false,
  });

  const [showModal, setShowModal] = useState(false);
  const [modalMessages, setModalMessages] = useState([]);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? e.target.checked : value,
    });
  };

  const validateForm = () => {
    let errors = [];
    if (!formData.companyName) errors.push("Company name is required.");
    if (!formData.email) errors.push("Email is required.");
    if (!formData.phone) errors.push("Phone number is required.");
    if (!formData.address) errors.push("Address is required.");
    if (!formData.password) errors.push("Password is required.");
    if (formData.password !== formData.confirmPassword)
      errors.push("Passwords do not match.");
    if (!formData.terms)
      errors.push("You must agree to the terms and conditions.");
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      setModalMessages(validationErrors);
      setShowModal(true);
    } else {
      try {
        const userData = {
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          name: formData.companyName,
          phone: formData.phone,
          role: "organiser",
          address: formData.address,
          website: formData.website,
          description: formData.description,
        };

        const response = await Api.registerUser(userData);

        if (response.ok) {
          const data = await response.json();
          setModalMessages([
            data.message || "Registration Successful! You can now log in.",
          ]);
          setShowModal(true);

          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          const errorData = await response.json();
          setModalMessages([
            errorData.message || "Registration failed. Please try again",
          ]);
          setShowModal(true);
        }
      } catch (err) {
        console.error("Registration error:", err);
        setModalMessages(["Registration failed. Please try again."]);
        setShowModal(true);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Back Button - moved to top left corner with white color */}
      <Button
        variant="ghost"
        className="absolute top-4 left-4 z-30 flex items-center gap-2 hover:bg-white/20 text-white"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>

      {/* Organization Description */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-10 flex flex-col justify-start pt-28 items-center text-center">
        <h1 className="text-4xl font-bold mb-6 text-white">VolunSphere</h1>
        <p className="text-xl mb-6 text-white">
          Connect your organisation with passionate volunteers
        </p>
        <div className="bg-white/20 p-6 rounded-lg backdrop-blur-sm">
          <p className="mb-4 text-lg text-white">Join our platform to:</p>
          <ul className="text-left list-disc pl-6 space-y-2 text-white">
            <li>Create and manage volunteer events</li>
            <li>Find dedicated volunteers for your causes</li>
            <li>Make a lasting impact in your community</li>
            <li>Track volunteer participation and engagement</li>
          </ul>
        </div>
      </div>

      {/* Registration Form */}
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center text-primary">
              Organization Registration
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  placeholder="Company Name"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Street name, Postal Code"
                  value={formData.address}
                  onChange={handleChange}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://yourorganization.com"
                  value={formData.website}
                  onChange={handleChange}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Tell us about your organization..."
                  value={formData.description}
                  onChange={handleChange}
                  className="border-gray-300 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={handleChange}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="border-gray-300"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.terms}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      terms: !!checked,
                    })
                  }
                />
                <Label
                  htmlFor="terms"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <span
                    className="text-primary underline cursor-pointer"
                    onClick={() => setShowTermsModal(true)}
                  >
                    terms and conditions
                  </span>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
              >
                Sign up
              </Button>

              <p className="text-center mt-6">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Login here
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Validation Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalMessages.length > 1 ? "Validation Error" : "Registration"}
            </DialogTitle>
            <DialogDescription>
              {modalMessages.length > 1 ? (
                <>
                  <div className="text-destructive font-semibold mb-2">
                    Please fix the following issues:
                  </div>
                  <ul className="list-disc pl-5">
                    {modalMessages.map((msg, index) => (
                      <li key={index} className="text-destructive">
                        {msg}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="text-green-600 font-semibold">
                  {modalMessages[0]}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowModal(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terms and Conditions Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Terms and Conditions</DialogTitle>
          </DialogHeader>
          <div className="py-4 max-h-96 overflow-y-auto">
            <p className="mb-4">
              Welcome to VolunSphere. Please read the following terms and
              conditions carefully:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must provide accurate and complete information.</li>
              <li>Your data will be used in compliance with privacy laws.</li>
              <li>
                VolunSphere is not liable for any damages caused by volunteering
                activities.
              </li>
              <li>
                By registering, you agree to receive communications about
                volunteering opportunities.
              </li>
              <li>
                Failure to comply with our guidelines may result in account
                suspension.
              </li>
            </ul>
            <p className="mt-4">
              For further inquiries, contact our support team.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowTermsModal(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RegistrationOrganiser;
