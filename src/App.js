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
  Tooltip,
  CircularProgress } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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

  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState(searchParams.get("path"));
  const [columns, setColumns] = useState(getInitialColumns(path));
  const [dataView, setDataView] = useState("");
  const [blockHeight, setBlockHeight] = useState("");
  const [currentBlockHeight, setCurrentBlockHeight] = useState("");
  const initialEndpoint = searchParams.get("endpoint") || apiEndpoints[0].value;
  const [apiEndpoint, setApiEndpoint] = useState(initialEndpoint);

  useEffect(() => {
    setLoading(true);
    const columnPaths = columns.map((_, idx) =>
      columns
        .slice(0, idx + 1)
        .map((col) => col.selected).filter((x) => x !== undefined)
        .join(".")
    );
    
    // Fetch columns
    const columnPromises = columnPaths.map((path, idx) =>
      columns[idx].items.length === 0
        ? fetchChildren(apiEndpoint, path, blockHeight).then((response) => {
            if (response) {
              setCurrentBlockHeight(response.blockHeight);
              return response.children;
            }
            return [];
          })
        : null
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
    }).finally(() => setLoading(false));

    // Fetch data
    console.log("blockHeight: " + blockHeight);
    fetchData(apiEndpoint, columnPaths.at(-1), blockHeight).then((response) => {
      if (response) {
        console.log("Data received from fetchData:", response.data);
        setDataView(JSON.stringify(cleanJSON(response.data)));
        setCurrentBlockHeight(response.blockHeight);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiEndpoint, path, blockHeight]);

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
      <AppBar position="static" sx={{ bgcolor: "#BB2D40", zIndex: 1100 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            VStorage Explorer
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              Height: {currentBlockHeight}
            </Typography>
            <IconButton
              onClick={() => {
                setBlockHeight((prev) => {
                  const newValue = Math.max(0, prev - 1);
                  document.querySelector('input[type="number"]').value = newValue;
                  return newValue;
                });
              }}
            >
              <RemoveIcon />
            </IconButton>
            <input
              type="number"
              inputMode="numeric"
              step="any"
              placeholder="Set Height (Optional)"
              onChange={(e) => {
                setBlockHeight(e.target.value);
              }}
              style={{
                width: "150px",
                padding: "5px",
                borderRadius: "16px",
                border: "1px solid #eee", // Lighter border color
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                color: "#f0f0f0", // Lighter text color
                textAlign: "center",
              }}
            />
            <IconButton
              onClick={() => {
                setBlockHeight((prev) => {
                  const newValue = prev + 1;
                  document.querySelector('input[type="number"]').value = newValue;
                  return newValue;
                });
              }}
              size="small"
              disabled={!blockHeight}
              color="inherit"
              aria-label="increase block height"
              sx={{ ml: 0.1 }}
            >
              <AddIcon />
            </IconButton>
          </Box>
          <Select
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.15)", // Semi-transparent white background
              height: 32,
              borderRadius: "16px", // Rounded corners
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
        maxSize={400}
        style={{ position: 'relative', width: '100%', height: '100%' }}
      >
        {loading && (
          <Box sx={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            zIndex: 1500 
          }}>
            <CircularProgress />
          </Box>
        )}
        <MillerColumns columns={columns} onItemSelected={handleItemSelected} isLoading={loading}/>
        <Box sx={{ position: 'relative' }}>
          <Tooltip title="Copy Data">
            <IconButton
              onClick={() => navigator.clipboard.writeText(dataView)}
              sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
            >
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
          <ContentPane content={dataToShow} />
        </Box>
      </SplitPane>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '2px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #ccc',
          position: 'fixed',
          bottom: 0,
          width: '100%',
          zIndex: 1100,
        }}
      >
        <IconButton
          component="a"
          href="https://github.com/agoric-labs/vstorage-viewer"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: 'inherit' }}
        >
          <img
            src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
            alt="GitHub Logo"
            style={{ width: 48, height: 48 }}
          />
        </IconButton>
        <Typography variant="body2" sx={{ ml: 'auto', mr: 2 }}>
          {`/custom/vstorage/children/${path ? `${path}` : ''}`}
        </Typography>
        </Box>
      </Box>
  );
};

export default App;
