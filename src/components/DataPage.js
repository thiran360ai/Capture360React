import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import CreateDataPage from "./CreateDataPage";
import { Box, Card, CardContent } from "@mui/material";
import "./DataPage.css";
import RegisterForm from "./RegisterForm";

const DataPage = ({ createUser = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { title, apiEndpoint } = location.state || {};
  const [fetchedData, setFetchedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [useStaticData, setUseStaticData] = useState(false);

  // Static data as fallback
  const staticData = [
    {
      id: 1,
      project: "PRJ001",
      name: "Building A",
      location: "New York",
      status: "Active",
      image: "images/building-a.jpg"
    },
    {
      id: 2,
      project: "PRJ002",
      name: "Building B",
      location: "Chicago",
      status: "Pending",
      image: "images/building-b.jpg"
    },
    {
      id: 3,
      project: "PRJ003",
      name: "Building C",
      location: "Los Angeles",
      status: "Completed",
      image: "images/building-c.jpg"
    },
    {
      id: 4,
      project: "PRJ004",
      name: "Building D",
      location: "Miami",
      status: "Active",
      image: "images/building-d.jpg"
    },
    {
      id: 5,
      project: "PRJ005",
      name: "Building E",
      location: "Seattle",
      status: "Planning",
      image: "images/building-e.jpg"
    }
  ];

  useEffect(() => {
    if (apiEndpoint) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(apiEndpoint, {
            headers: {
              Accept: "application/json",
            },
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const jsonData = await response.json();
          if (jsonData && jsonData.length > 0) {
            setFetchedData(jsonData);
            setUseStaticData(false);
          } else {
            console.log("No data from API, using static data");
            setFetchedData(staticData);
            setUseStaticData(true);
          }
        } catch (error) {
          console.error("Failed to fetch data:", error);
          console.log("API error, falling back to static data");
          setFetchedData(staticData);
          setUseStaticData(true);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    } else {
      console.log("No API endpoint provided, using static data");
      setFetchedData(staticData);
      setUseStaticData(true);
      setIsLoading(false);
    }
  }, [apiEndpoint]);

  const handleView = async (row) => {
    if (!row.project) {
      console.error("Project ID is missing:", row);
      return;
    }

    if (useStaticData) {
      // Use static plan details if we're in static data mode
      const planDetailsData = {
        project_id: row.project,
        name: row.name,
        floors: [
          {
            id: 1,
            name: "Ground Floor",
            area: "1200 sq ft",
            status: "Completed"
          },
          {
            id: 2,
            name: "First Floor",
            area: "1100 sq ft",
            status: "In Progress"
          },
          {
            id: 3,
            name: "Second Floor",
            area: "1000 sq ft",
            status: "Pending"
          }
        ]
      };

      navigate("/plan-details", {
        state: { title: `Plan Details for Project ${row.project}`, data: planDetailsData },
      });
    } else {
      // Try to fetch from API first
      try {
        const viewUrl = `https://api.capture360.ai/building/plans/project/${row.project}/`;
        const response = await fetch(viewUrl, {
          headers: {
            Accept: "application/json",
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        navigate("/plan-details", {
          state: { title: `Plan Details for Project ${row.project}`, data },
        });
      } catch (error) {
        console.error("Failed to fetch view data:", error);
        console.log("Falling back to static plan details");
        
        // Fallback to static plan details on API error
        const planDetailsData = {
          project_id: row.project,
          name: row.name,
          floors: [
            {
              id: 1,
              name: "Ground Floor",
              area: "1200 sq ft",
              status: "Completed"
            },
            {
              id: 2,
              name: "First Floor",
              area: "1100 sq ft",
              status: "In Progress"
            },
            {
              id: 3,
              name: "Second Floor",
              area: "1000 sq ft",
              status: "Pending"
            }
          ]
        };

        navigate("/plan-details", {
          state: { title: `Plan Details for Project ${row.project}`, data: planDetailsData },
        });
      }
    }
  };

  const renderImage = (imageUrl, name) => {
    // If we're using static data, use a placeholder
    if (useStaticData) {
      const placeholderUrl = `https://api.capture360.ai/${name.replace(/\s/g, '+')}`;
      return (
        <img
          src={placeholderUrl}
          alt={name}
          style={{
            width: "100px",
            height: "auto",
            cursor: "pointer",
            borderRadius: "8px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          }}
          onClick={() =>
            navigate("/image-view", { state: { imageUrl: placeholderUrl, name } })
          }
        />
      );
    }
    
    // If using API data, use the original API URL
    const url = `https://api.capture360.ai/${imageUrl}`;
    return (
      <img
        src={url}
        alt={name}
        style={{
          width: "100px",
          height: "auto",
          cursor: "pointer",
          borderRadius: "8px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        }}
        onClick={() =>
          navigate("/image-view", { state: { imageUrl: url, name } })
        }
      />
    );
  };

  const openCreateDrawer = () => {
    setIsCreateDrawerOpen(true);
  };

  const closeCreateDrawer = () => {
    setIsCreateDrawerOpen(false);
  };

  // Render table based on the data we have
  const renderTable = () => {
    if (isLoading) {
      return (
        <Typography variant="body1" style={{ fontSize: "16px", color: "#333", padding: "20px" }}>
          Loading...
        </Typography>
      );
    }

    if (!fetchedData || fetchedData.length === 0) {
      return (
        <Typography variant="body1" style={{ fontSize: "16px", color: "#333", padding: "20px" }}>
          No data available.
        </Typography>
      );
    }

    const columns = Object.keys(fetchedData[0]);

    return (
      <Table style={{ width: "100%" }}>
        <TableHead style={{ backgroundColor: "#f0f0f0" }}>
          <TableRow>
            {columns.map((key, index) => (
              <TableCell
                key={index}
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#004e92",
                  textTransform: "capitalize",
                }}
              >
                {key}
              </TableCell>
            ))}
            <TableCell
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#004e92",
                textAlign: "center",
              }}
            >
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fetchedData.map((row, index) => (
            <TableRow
              key={index}
              style={{
                backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = index % 2 === 0 ? "#f9f9f9" : "#ffffff")}
            >
              {Object.entries(row).map(([key, value], idx) => (
                <TableCell
                  key={idx}
                  style={{
                    fontSize: "16px",
                    fontWeight: "500",
                    color: "#333333",
                    padding: "12px",
                  }}
                >
                  {key === "image" ? renderImage(value, row.name) : value}
                </TableCell>
              ))}
              <TableCell style={{ textAlign: "center" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleView(row)}
                  style={{
                    width: "180px",
                    color: "#ffffff",
                    margin: "10px 0",
                    borderRadius: 6,
                    textTransform: "none",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#00509e")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#006bb3")
                  }
                >
                  View Floor Data
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Card
      style={{
        width: "1100px",
        height: "650px",
        boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.1)",
        marginTop: "20px",
        borderRadius: "12px",
        backgroundColor: "#ffffff",
        overflow: "auto",
        transition: "all 0.3s ease",
        marginLeft: "150px",
      }}
    >
      <CardContent>
        <Typography
          variant="h4"
          gutterBottom
          style={{
            color: "#004e92",
            fontWeight: "600",
            paddingLeft: "20px",
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          {title || "Data Page"}
          {useStaticData && (
            <Typography
              variant="subtitle1"
              style={{
                color: "#ff9800",
                fontWeight: "500",
                fontSize: "14px",
              }}
            >
              
            </Typography>
          )}
        </Typography>
        <Box
          className="button-container"
          style={{
            marginLeft: "80%",
            justifyContent: "flex-end",
            marginBottom: "20px",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={openCreateDrawer}
            style={{
              color: "#ffffff",
              margin: "10px 0",
              borderRadius: 6,
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = "#00509e")
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "#006bb3")
            }
          >
            Create User
          </Button>
        </Box>

        {renderTable()}

        <Drawer
          anchor="right"
          open={isCreateDrawerOpen}
          onClose={closeCreateDrawer}
          transitionDuration={500}
          style={{
            transition: "all 0.3s ease",
          }}
        >
          {!createUser ? (
            <CreateDataPage onClose={closeCreateDrawer} />
          ) : (
            <RegisterForm onClose={closeCreateDrawer} />
          )}
        </Drawer>
      </CardContent>
    </Card>
  );
};

export default DataPage;