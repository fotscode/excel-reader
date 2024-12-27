import path from "path";

const uploadsPath = path.join(__dirname, "..", "..", "uploads");
const multerUploadPath = "uploads/";

enum SortDirection {
    ASC = "asc",
    DESC = "desc"

}

const paginationDefaults = {
    page: 1,
    limit: 10,
    sort: SortDirection.ASC
}

export { uploadsPath, paginationDefaults, multerUploadPath, SortDirection };