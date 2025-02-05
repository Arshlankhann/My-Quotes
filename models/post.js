const mongoose = require("mongoose")

  //new

const postSchema = mongoose.Schema({
    username: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"user"
        
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    profilepic: {
        type: String,
        default: "default.jpg"
    },
    date: {
        type: Date,
        default: Date.now
    },
    content: String,
    likes: [{
        type: mongoose.Schema.Types.ObjectId, ref: "user"
    }]

})
module.exports = mongoose.model("post", postSchema)