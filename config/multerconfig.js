const multer = require("multer")
const path = require("path")
const crypto = require("crypto")

//disk storage
const storage = multer.diskStorage({
    //setting folder of file
    destination: function (req, file, cb) {
        cb(null, "./public/image/uploads")
    },
    //setting file unique name
    filename: function (req, file, cb) {
        crypto.randomBytes(12, function (err, name) {
            const fn = name.toString("hex") + path.extname(file.originalname)
            cb(null, fn)
        })
    }
})


//export upload variable
const upload = multer({ storage: storage })

module.exports = upload;