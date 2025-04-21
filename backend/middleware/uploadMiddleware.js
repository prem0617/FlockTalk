import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname manually for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const uploadDir = path.join(__dirname, "..", "postTemp"); // Going one folder back
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir); // Use the correct absolute path
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now();
    const ext = path.extname(file.originalname);
    const fileName = file.originalname.split(".")[0] + "-" + uniqueSuffix + ext;
    cb(null, fileName);
  },
});

export const upload = multer({ storage });
