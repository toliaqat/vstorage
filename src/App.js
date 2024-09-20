import React, { useState, useEffect } from "react";
import MillerColumns from "./MillerColumns";
import ContentPane from "./ContentPane";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Select,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { fetchChildren, fetchData } from "./api";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import apiEndpoints from "./config";
import { cleanJSON } from "./utils";
import SplitPane from 'react-split-pane';

import './App.css';

const updateQueryParam = (key, value) => {
  const params = new URLSearchParams(window.location.search);
  params.set(key, value);
  const newUrl = `${window.location.protocol}//${window.location.host}${
    window.location.pathname
  }?${params.toString()}`;
  window.history.pushState({ path: newUrl }, "", newUrl);
};

const getInitialColumns = (path) => {
  const defaultColumn = { items: [] };
  if (!path) return [defaultColumn];

  const pathElements = path.split(".");
  const columns = pathElements.map((element) => ({
    items: [],
    selected: element,
  }));

  return [defaultColumn, ...columns];
};

const App = () => {
  const searchParams = new URLSearchParams(window.location.search);

  const [path, setPath] = useState(searchParams.get("path"));
  const [columns, setColumns] = useState(getInitialColumns(path));
  const [dataView, setDataView] = useState("");
  const [blockHeight, setBlockHeight] = useState("");
  const initialEndpoint = searchParams.get("endpoint") || apiEndpoints[0].value;
  const [apiEndpoint, setApiEndpoint] = useState(initialEndpoint);

  useEffect(() => {
    const columnPaths = columns.map((_, idx) =>
      columns
        .slice(0, idx + 1)
        .map((col) => col.selected).filter((x) => x !== undefined)
        .join(".")
    );
    // Fetch columns
    const columnPromises = columnPaths.map((path, idx) =>
      columns[idx].items.length === 0 ? fetchChildren(apiEndpoint, path, blockHeight) : null
    );
    Promise.all(columnPromises).then((responses) => {
      setColumns((prevColumns) =>
        prevColumns.map((column, idx) => ({
          selected: column.selected,
          items: responses[idx]
            ? responses[idx].map((name) => ({
                name,
                isSelected: prevColumns[idx + 1]?.selected === name,
              }))
            : column.items,
        }))
      );
    });

    // Fetch data
    fetchData(apiEndpoint, columnPaths.at(-1), blockHeight).then((data) => {
      console.log("Data received from fetchData:", data);
      setDataView(JSON.stringify(cleanJSON(data)));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiEndpoint, path]);

  useEffect(() => {
    const pathString = columns
      .slice(1)
      .map((col) => col.selected)
      .join(".");
    updateQueryParam("path", pathString);
    setPath(pathString);
  }, [columns]);

  useEffect(() => {
    updateQueryParam("endpoint", apiEndpoint);
  }, [apiEndpoint]);

  const handleItemSelected = async (itemName, columnIndex) => {
    // Return early if the item is already selected
    if (columns[columnIndex]?.selected === itemName) return;

    setDataView("");
    const newColumns = columns.slice(0, columnIndex + 1);
    newColumns[columnIndex] = {
      ...newColumns[columnIndex],
      items: newColumns[columnIndex].items.map((item) => ({
        ...item,
        isSelected: item.name === itemName,
      })),
    };
    const newPath = newColumns
      .slice(1)
      .map((col) => col.selected)
      .concat(itemName)
      .join(".");
    updateQueryParam("path", newPath);
    setPath(newPath);
    setColumns((prevColumns) => {
      const newColumns = prevColumns.slice(0, columnIndex + 1);
      newColumns[columnIndex] = {
        ...newColumns[columnIndex],
        items: newColumns[columnIndex].items.map((item) => ({
          ...item,
          isSelected: item.name === itemName,
        })),
      };
      return [...newColumns, { selected: itemName, items: [] }];
    });
  };

  const handleEndpointChange = (event) => {
    setColumns(getInitialColumns(null));
    const newEndpoint = event.target.value;
    setApiEndpoint(newEndpoint);
    updateQueryParam("endpoint", newEndpoint);
  };

  const dataToShow = columns.at(-1).items.length === 0 && dataView;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <AppBar position="static" sx={{ bgcolor: "#ed2c2c", zIndex: 1100 }}>
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
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <IconButton
              onClick={() => setBlockHeight((prev) => Math.max(0, prev - 1))}
              size="small"
              color="inherit"
              aria-label="decrease block height"
              sx={{ mr: 1 }}
            >
              <RemoveIcon />
            </IconButton>
            <input
              type="number"
              value={blockHeight}
              inputMode="numeric"
              step="any"
              placeholder="Height (Optional)"
              onChange={(e) => setBlockHeight(e.target.value)}
              style={{
                width: "150px",
                padding: "5px",
                borderRadius: "4px",
                border: "1px solid #eee", // Lighter border color
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                color: "#f0f0f0", // Lighter text color
                textAlign: "center",
              }}
            />
            <IconButton
              onClick={() => setBlockHeight((prev) => prev + 1)}
              size="small"
              color="inherit"
              aria-label="increase block height"
              sx={{ ml: 1 }}
            >
              <AddIcon />
            </IconButton>
          </Box>
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
      <SplitPane
        split="horizontal" // or "vertical" based on your layout
        defaultSize="50%"
        minSize={100}
        maxSize={500}
        style={{ position: 'relative', width: '100%', height: '100%' }}
      >
        <MillerColumns columns={columns} onItemSelected={handleItemSelected} />
        <ContentPane content={dataToShow} />
      </SplitPane>
    </Box>
  );
};

export default App;
