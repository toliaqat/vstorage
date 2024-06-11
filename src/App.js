import React, { useState, useEffect } from "react";
import MillerColumns from "./MillerColumns";
import ContentPane from "./ContentPane";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { fetchChildren, fetchData } from "./api";
import apiEndpoints from "./config";
import { cleanJSON } from "./utils";

const App = () => {
  const [columns, setColumns] = useState([]);
  const [dataView, setDataView] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState(apiEndpoints[0].value);

  useEffect(() => {
    fetchChildren(apiEndpoint, "published").then((data) =>
      setColumns([
        {
          items: data.map((name) => ({ name, isSelected: false })),
          selected: null,
        },
      ])
    );
  }, [apiEndpoint]);

  const handleItemSelected = async (itemName, columnIndex) => {
    // Start building the path from 'published'
    let path = "published";

    // Update columns up to the current index
    const updatedColumns = columns.slice(0, columnIndex + 1);
    updatedColumns[columnIndex] = {
      ...updatedColumns[columnIndex],
      items: updatedColumns[columnIndex].items.map((item) => ({
        ...item,
        isSelected: item.name === itemName,
      })),
      selected: itemName,
    };

    // Include the selected items from previous columns in the path
    updatedColumns.forEach((col) => {
      if (col.selected) {
        path += `.${col.selected}`;
      }
    });

    const children = await fetchChildren(apiEndpoint, path);
    if (children.length === 0) {
      const data = await fetchData(apiEndpoint, path);
      setDataView(cleanJSON(JSON.stringify(data), null, 2));
    }
    const newColumns = updatedColumns.slice(0, columnIndex + 1);
    newColumns.push({
      items: children.map((name) => ({ name, isSelected: false })),
      selected: null,
    });
    setColumns(newColumns);
  };

  const handleEndpointChange = (event) => {
    setApiEndpoint(event.target.value);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: "#ed2c2c" }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            VStorage Explorer
          </Typography>
          <Select
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.15)", // Semi-transparent white background
              height: 32,
            }}
            value={apiEndpoint}
            onChange={handleEndpointChange}
            displayEmpty
            inputProps={{ "aria-label": "Without label" }}
            style={{ color: "white", bgcolor: "#ed2c2c" }}
          >
            {apiEndpoints.map((endpoint) => (
              <MenuItem key={endpoint.value} value={endpoint.value}>
                {endpoint.label}
              </MenuItem>
            ))}
          </Select>
        </Toolbar>
      </AppBar>
      <Box>
        <MillerColumns columns={columns} onItemSelected={handleItemSelected} />
        <ContentPane content={dataView} />
      </Box>
    </Box>
  );
};

export default App;
