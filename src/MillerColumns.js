import React, { useState, useRef, useEffect } from "react";
import { Box, List, ListItem, ListItemText } from "@mui/material";

const MillerColumns = ({ columns, onItemSelected }) => {
  const [filterTexts, setFilterTexts] = useState(Array(columns.length).fill(""));

  const debounceTimeouts = useRef([]);

  const handleFilterChange = (e, columnIndex) => {
    const newFilterTexts = [...filterTexts];
    newFilterTexts[columnIndex] = e.target.value;

    if (debounceTimeouts.current[columnIndex]) {
      clearTimeout(debounceTimeouts.current[columnIndex]);
    }

    debounceTimeouts.current[columnIndex] = setTimeout(() => {
      setFilterTexts(newFilterTexts);
    }, 300); // 300ms delay
  };
  const fullColumns = [...columns];

  useEffect(() => {
    setFilterTexts(Array(columns.length).fill(""));
  }, [columns]);
  while (fullColumns.length < 6) {
    fullColumns.push([]); // Add empty arrays for missing columns
  }

  return (
    <Box display="flex" height="100%" width="100%" overflow="hidden" bgcolor="#f7f7f7">
      {fullColumns.map((column, columnIndex) => (
        <List
          key={columnIndex}
          style={{
            minWidth: '200px',
            width: 'auto',
            overflowY: "auto",
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            maxHeight: "500px",
            margin: "10px 5px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          {column.items && column.items.length > 10 && (
            <ListItem key={`input-${columnIndex}`} style={{ padding: "0px 16px" }}>
              <input
                type="text"
                placeholder="Filter..."
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "8px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
                onChange={(e) => handleFilterChange(e, columnIndex)}
              />
            </ListItem>
          )}
          {column.items ? (
            column.items
              .filter((item) =>
                item.name.toLowerCase().includes(filterTexts[columnIndex].toLowerCase())
              )
              .map((item, itemIndex) => (
              <ListItem
                button
                key={`${item.name}-${itemIndex}`}
                onClick={() => onItemSelected(item.name, columnIndex)}
                selected={item.isSelected}
                style={{

                  backgroundColor: item.isSelected ? "#FFBC0A" : "transparent",
                  padding: "0px 16px",
                }}
              >
                <ListItemText primary={item.name} />
              </ListItem>
            ))
          ) : (
            <ListItem
              key={`placeholder-${columnIndex}`}
              style={{ padding: "0px 16px" }}
            >
              <ListItemText primary="" />
            </ListItem>
          )}
        </List>
      ))}
    </Box>
  );
};

export default MillerColumns;
