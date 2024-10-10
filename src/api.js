const defaultPath = "/custom/vstorage/children/";

export const fetchChildren = async (apiEndpoint, path, blockHeight) => {
  const url = `${apiEndpoint.replace('.api.', '.rpc.')}`;

  const requestBody = {
    jsonrpc: "2.0",
    id: 1,
    method: "abci_query",
    params: {
      path: `${defaultPath}${path ? `${path}` : ''}`,
      height: blockHeight && blockHeight !== "0" ? blockHeight.toString() : "0",
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
    return {
      children: decodedValue.children || [],
      blockHeight: jsonResponse.result.response.height,
    };
  } catch (error) {
    console.error("Fetching error:", error);
    return [];
  }
};

export const fetchData = async (apiEndpoint, path, blockHeight) => {
  const url = `${apiEndpoint.replace('.api.', '.rpc.')}`;
  const requestBody = {
    jsonrpc: "2.0",
    id: 1,
    method: "abci_query",
    params: {
      path: `${defaultPath.replace('/children/', '/data/')}${path ? `${path}` : ''}`,
      height: blockHeight && blockHeight !== "0" ? blockHeight.toString() : "0",
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
    if (jsonResponse.result.response.code !== 0) {
      return null;
    }
    const base64Value = jsonResponse.result.response.value;
    let parsedData = JSON.parse(atob(base64Value));
    if (typeof parsedData === 'string') {
      parsedData = JSON.parse(parsedData);
    }

    // Check if the path matches the specified pattern
    let walletId = null;
    const vaultPattern = /published\.vaultFactory\.managers\.manager[0-9]\.vaults.vault[0-9]+/;
    if (vaultPattern.test(path)) {
      const vaultId = path.split('/').pop(); // Extract the vault ID
      walletId = await fetchWalletIdByVaultId(vaultId);
      walletId = walletId ? walletId.split('.').slice(-2, -1)[0] : null;
    }
    return {
      data: parsedData,
      blockHeight: jsonResponse.result.response.height,
      walletId
    };
  } catch (error) {
    console.error("Fetching data error:", error, "Request body:", requestBody);
    return "Failed to fetch data";
  }
};
export const fetchWalletIdByVaultId = async (vaultId) => {
  const query = {
    query: `
      {
        vaults(
          filter: {id: {equalTo: "${vaultId}"}}
        ) {
          nodes {
            id
            walletId
          }
        }
      }
    `,
  };

  try {
    const response = await fetch("https://api.subquery.network/sq/agoric-labs/agoric-mainnet-v2", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const jsonResponse = await response.json();
    const nodes = jsonResponse.data.vaults.nodes;
    if (nodes.length > 0) {
      return nodes[0].walletId;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Fetching wallet ID error:", error);
    return null;
  }
};
