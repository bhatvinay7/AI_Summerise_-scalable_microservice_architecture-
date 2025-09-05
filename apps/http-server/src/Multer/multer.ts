import multer from "multer";
import fs from "fs";
import path from "path";

const uploadPath = path.join(process.cwd(), "uploads");
// make sure directory exists
if (!fs.existsSync(`${uploadPath}`)) {
  fs.mkdirSync(`${uploadPath}`, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,`${uploadPath}`)
  },
  filename: function (req, file, cb) {
    const adduniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + adduniqueSuffix+`_${file.originalname.split(".")[1]}`)
  }
})

const upload = multer({ storage: storage })
export default upload