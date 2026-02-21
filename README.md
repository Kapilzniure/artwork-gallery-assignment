# Art Institute of Chicago - Artwork Gallery

A React application built with **Vite** and **TypeScript** that displays artwork data from the Art Institute of Chicago API. This project features server-side pagination and a custom persistent row selection strategy.

## 🚀 Features

- **Vite + TypeScript**: Modern, fast development environment.
- **PrimeReact DataTable**: Robust UI components for data display and interaction.
- **Server-Side Pagination**: Data is fetched per page (12 rows per page) to ensure optimal performance and low memory usage.
- **Persistent Selection**: Row selections are maintained across page navigations.
- **Custom Row Selection (Select N)**: An overlay panel allows users to select a specific number of rows across the entire dataset instantly.
- **Optimized Selection Strategy**: 
  - **No Pre-fetching**: Unlike common "bad" implementations, this app does **not** fetch multiple pages in a loop to select rows.
  - **Virtual Selection Logic**: Selection is calculated on-the-fly using a global index comparison combined with manual selection/deselection overrides (stored as Maps). This ensures that selecting 1,000+ rows is instant and uses minimal memory.
- **Live Selection Counter**: Displays the total number of selected artworks at the top of the table.

## 🛠️ Technical Stack

- **Framework**: React 19 (Vite)
- **Language**: TypeScript
- **UI Components**: PrimeReact
- **Styling**: PrimeFlex / CSS
- **API Handling**: Axios

## 📋 Data Fields Displayed

- `title`
- `place_of_origin`
- `artist_display`
- `inscriptions`
- `date_start`
- `date_end`

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd <project-folder>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 🧠 Implementation Note: Selection Strategy
To meet the requirement of selecting 'N' rows without pre-fetching other pages, I implemented a **Virtual Selection** strategy. 
- A `bulkSelectionLimit` state tracks the user's requested count.
- As the user navigates pages, the application calculates the `globalIndex` of each row: `(page - 1) * rowsPerPage + localIndex + 1`.
- Rows are automatically marked as "selected" if their `globalIndex` is within the limit, unless the user manually deselects them.
- Manual toggles (selections and deselections) are stored in `Map` objects to ensure they persist across page changes without needing to store the entire artwork object or fetch all IDs in advance.
