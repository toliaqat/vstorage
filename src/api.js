export const fetchChildren = async (apiEndpoint, path) => {
  const url = `${apiEndpoint}/agoric/vstorage/children/${path}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    const { children } = await response.json();
    return children;
  } catch (error) {
    console.error("Fetching error:", error);
    return [];
  }
};

export const fetchData = async (apiEndpoint, path) => {
  const url = `${apiEndpoint}/agoric/vstorage/data/${path}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error("Fetching data error:", error);
    return "Failed to fetch data";
  }
};
