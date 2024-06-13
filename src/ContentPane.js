import React from "react";
import { Box } from "@mui/material";
import ReactJson from "react-json-view";

const ContentPane = ({ content }) => {
  // Attempt to parse the JSON content for display
  const parseJson = (jsonContent) => {
    try {
      return JSON.parse(jsonContent);
    } catch (e) {
      return undefined;
    }
  };

  const json = parseJson(content);
  if (!content) {
    return null;
  }
  return (
    <Box
      flex="1"
      bgcolor="#ffffff"
      borderRadius="8px"
      boxShadow="0 2px 4px rgba(0,0,0,0.5)"
      margin="10px"
      overflow="auto"
      padding={2}
      style={{ whiteSpace: 'pre-wrap' }}
    >
      {json ? (
        <ReactJson
          src={json}
          theme="rjv-default"
          indentWidth={2}
          collapsed={false}
          enableClipboard={false}
          displayObjectSize={false}
          displayDataTypes={false}
        />
      ) : (
        <p></p>
      )}
    </Box>
  );
};

export default ContentPane;
