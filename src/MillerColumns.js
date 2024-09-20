import React, { useState, useRef, useEffect } from "react";
import { Box, List, ListItem, ListItemText, InputAdornment, TextField } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';

const MillerColumns = ({ columns, onItemSelected}) => {
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
    <Box display="flex" height="100%" width="100%" overflow="hidden" bgcolor="#f7f7f7" position="relative">
      {fullColumns.map((column, columnIndex) => (
        column.items && column.items.length > 0 && (
          <List
            key={columnIndex}
            style={{
              minWidth: '200px',
              width: 'auto',
              overflowY: "auto",
              borderRadius: "8px",
              backgroundColor: "#ffffff",
              minHeight: "350px",
              maxHeight: "350px",
              margin: "10px 5px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {column.items.length > 10 && (
              <Box key={`input-container-${columnIndex}`} sx={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#ffffff' }}>
                <ListItem key={`input-${columnIndex}`} style={{ padding: "0px 16px" }}>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search..."
                    fullWidth
                    margin="dense"
                    onChange={(e) => handleFilterChange(e, columnIndex)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px', // Rounded corners
                        '& .MuiOutlinedInput-input': {
                          fontSize: '0.75rem', // Increased font size
                          padding: '8px 14px', // Increased height
                        },
                      },
                    }}
                  />
                </ListItem>
              </Box>
            )}
            {column.items
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
                    backgroundColor: item.isSelected ? "#ffcccc" : "transparent",
                    padding: "0px 16px",
                  }}
                >
                  <ListItemText primary={item.name} />
                </ListItem>
              ))}
          </List>
        )
      ))}
      
    </Box>
  );
};

export default MillerColumns;
