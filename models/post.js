const mongoose = require("mongoose")

mongoose.connect('mongodb://127.0.0.1:27017/My_Quotes')  //new

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