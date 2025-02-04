const mongoose = require("mongoose")

mongoose.connect('mongodb://127.0.0.1:27017/My_Quotes')  //new

const postSchema = mongoose.Schema({
<<<<<<< HEAD
    username: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"user"
        
    },
=======
   
>>>>>>> 2344613ff57c6ac0b9c07dc7a51c4133bb6228a8
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