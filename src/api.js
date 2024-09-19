export const fetchChildren = async (apiEndpoint, path) => {
  const url = `${apiEndpoint}`;
  const defaultPath = "/custom/vstorage/children/published";
  const defaultDataPath = "/custom/vstorage/data";
  const defaultDataPath = "/custom/vstorage/data";
  const requestBody = {
    jsonrpc: "2.0",
    id: 1,
    method: "abci_query",
    params: {
      path: path || defaultPath,
      height: "0", // Assuming blockHeightInput.text is not available here
    },
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) throw new Error("Network response was not ok");
    const { children } = await response.json();
    return children;
  } catch (error) {
    console.error("Fetching error:", error);
    return [];
  }
};

export const fetchData = async (apiEndpoint, path) => {
  const url = `${apiEndpoint}`;
  const requestBody = {
    jsonrpc: "2.0",
    id: 1,
    method: "abci_query",
    params: {
      path: path || defaultDataPath,
      height: "0", // Assuming blockHeightInput.text is not available here
    },
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error("Fetching data error:", error);
    return "Failed to fetch data";
  }
};
