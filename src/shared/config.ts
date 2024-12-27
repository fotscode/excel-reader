import path from "path";

const uploadsPath = path.join(__dirname, "..", "..", "uploads");

const paginationDefaults = {
    page: 1,
    limit: 10,
    sort: 'asc'
}

export { uploadsPath, paginationDefaults };