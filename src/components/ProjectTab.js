import React, { useEffect, useState } from "react";
import { Table, Button, Container, Spinner } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ProjectTab.css"; // Import custom CSS

const ProjectTab = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("https://api.capture360.ai/building/project/");
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleProjectClick = () => {
    navigate(`/project-manager`);
  };

  return (
    <Container className="project-container">
      <h2 className="project-title">Project List</h2>

      {loading ? (
        <div className="loading-container">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <div className="table-wrapper">
          <Table striped hover responsive className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Project Name</th>
                <th>Company Name</th>
                <th>Location</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {projects.length > 0 ? (
                projects.map((project) => (
                  <tr key={project.id}>
                    <td>{project.id}</td>
                    <td>{project.project_name}</td>
                    <td>{project.company_name}</td>
                    <td>{project.location}</td>
                    <td>
                      <Button
                        variant="primary"
                        className="view-btn"
                        onClick={() => handleProjectClick(project.id)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No Data Available
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default ProjectTab;
