import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './ProjectTab.css'; // Import the CSS for styling

const ProjectTab = () => {
  const [projects, setProjects] = useState([]); // State to store project data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  const navigate = useNavigate(); // To navigate to other pages

  // Fetching data from API
  useEffect(() => {
    axios
      .get('https://api.capture360.ai/building/project/') // API URL
      .then((response) => {
        setProjects(response.data); // Set the fetched data into state
        setLoading(false); // Set loading to false after data is fetched
      })
      .catch((err) => {
        setError('Failed to fetch data'); // Handle error
        setLoading(false); // Set loading to false if error occurs
      });
  }, []); // Empty array ensures the useEffect runs only once when the component mounts

  // Navigate to CreateDataPage.js when 'View Details' is clicked
  const handleViewDetails = (id) => {
    navigate(`/createdatapage/${id}`); // Navigate to CreateDataPage with project ID
  };

  // Handle loading state
  if (loading) {
    return <div>Loading...</div>; // Display loading message
  }

  // Handle error state
  if (error) {
    return <div>{error}</div>; // Display error message
  }

  return (
    <Container>
      <Row>
        {projects.map((project) => (
          <Col key={project.id} sm={12} md={6} lg={4}> {/* Responsive layout */}
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>{project.project_name}</Card.Title> {/* Display project name */}
                <Card.Subtitle className="mb-2 text-muted">{project.company_name}</Card.Subtitle> {/* Display company name */}
                <Card.Text>
                  Location: {project.location} {/* Display location */}
                </Card.Text>
                <Button
                  variant="primary"
                  onClick={() => handleViewDetails(project.id)} // Navigate to details page with ID
                >
                  View Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default ProjectTab;
