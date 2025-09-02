import multer from "multer";
import fs from "fs";

// make sure directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"./uploads")
  },
  filename: function (req, file, cb) {
    const adduniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + adduniqueSuffix+`?${file.originalname.split(".")[1]}`)
  }
})

const upload = multer({ storage: storage })
export default upload