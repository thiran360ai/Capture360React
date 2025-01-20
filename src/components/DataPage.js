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

const DataPage = ({ createUser } = false) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { title, apiEndpoint } = location.state || {};
  const [fetchedData, setFetchedData] = useState(null);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  useEffect(() => {
    if (apiEndpoint) {
      const fetchData = async () => {
        try {
          const response = await fetch(apiEndpoint, {
            headers: {
              Accept: "application/json",
              
            },
          });
          const jsonData = await response.json();
          setFetchedData(jsonData);
        } catch (error) {
          console.error("Failed to fetch data:", error);
        }
      };
      fetchData();
    }
  }, [apiEndpoint]);

  const handleView = async (row) => {
    if (!row.project) {
      console.error("Project ID is missing:", row);
      return;
    }

    try {
      const viewUrl = `http://59.97.51.97:8081/building/plans/project/${row.project}/`;
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
    }
  };

  const renderImage = (imageUrl, name) => {
    const url = `http://59.97.51.97:8081/${imageUrl}`;
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

  return (
    <Card
      style={{
        width: "1100px",
        height: "650px",
        boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.1)",
        paddingTop: "20px",
        borderRadius: "12px",
        backgroundColor: "#ffffff",
        overflow: "auto",
        transition: "all 0.3s ease",
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
          {title}
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

        {fetchedData ? (
          <Table style={{ width: "100%" }}>
            <TableHead style={{ backgroundColor: "#f0f0f0" }}>
              <TableRow>
                {Object.keys(fetchedData[0]).map((key, index) => (
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
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "")}
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
        ) : (
          <Typography variant="body1" style={{ fontSize: "16px", color: "#333" }}>
            Loading...
          </Typography>
        )}

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
