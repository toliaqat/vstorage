# VStorage Viewer

This is a web application designed to explore and visualize VStorage. It provides an intuitive interface for navigating through data layers and viewing detailed information.

## Build Steps

To set up and run the project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/agoric-labs/vstorage-viewer.git
   cd vstorage-viewer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

   This will create an optimized production build in the `build` folder.

## Main Features

- Easily navigate through hierarchical data using a multi-column layout
- Sharable (URL encodes queried path and endpoint)
- Pick among all production and testnets
- Support any testnet with URL query path
- Substring filter for long list in the column
- Step back through block history
