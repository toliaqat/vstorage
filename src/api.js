const defaultPath = "/custom/vstorage/children/";

export const fetchChildren = async (apiEndpoint, path, blockHeight) => {
  const url = `${apiEndpoint}`;

  const requestBody = {
    jsonrpc: "2.0",
    id: 1,
    method: "abci_query",
    params: {
      path: `${defaultPath}${path ? `${path}` : ''}`,
      height: blockHeight && blockHeight !== "0" ? blockHeight : "0",
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
    const jsonResponse = await response.json();
    const base64Value = jsonResponse.result.response.value;
    const decodedValue = JSON.parse(atob(base64Value));
    return decodedValue.children || [];
  } catch (error) {
    console.error("Fetching error:", error);
    return [];
  }
};

export const fetchData = async (apiEndpoint, path, blockHeight) => {
  const url = `${apiEndpoint}`;
  const requestBody = {
    jsonrpc: "2.0",
    id: 1,
    method: "abci_query",
    params: {
      path: `${defaultPath.replace('/children/', '/data/')}${path ? `${path}` : ''}`,
      height: blockHeight && blockHeight !== "0" ? blockHeight : "0",
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
    const jsonResponse = await response.json();
    console.log("fetchData response:", jsonResponse);
    if (jsonResponse.result.response.code !== 0) {
      return null;
    }
    const base64Value = jsonResponse.result.response.value;
    let parsedData = JSON.parse(atob(base64Value));
    if (typeof parsedData === 'string') {
      parsedData = JSON.parse(parsedData);
    }
    console.log("Parsed data:", parsedData);
    return parsedData;
  } catch (error) {
    console.error("Fetching data error:", error, "Request body:", requestBody);
    return "Failed to fetch data";
  }
};
