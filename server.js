var express = require("express"),
    http = require("http"),
    socketIo = require("socket.io"),
    // import the mongoose library
    mongoose = require("mongoose"),
    app = express();
var socket;
app.use(express.static(__dirname + "/client"));
app.use(express.bodyParser());

// connect to the amazeriffic data store in mongo
mongoose.connect('mongodb://localhost/amazeriffic');

// This is our mongoose model for todos
var ToDoSchema = mongoose.Schema({
    description: String,
    tags: [ String ]
});

var ToDo = mongoose.model("ToDo", ToDoSchema);

var server =http.createServer(app);
var io = socketIo(server);
server.listen(3000);

io.on("connection",function(sct){
    console.log("connected");
   socket = sct;
});
app.get("/todos.json", function (req, res) {
    ToDo.find({}, function (err, toDos) {
        res.json(toDos);
    });
});

function sendToAll(result){
     socket.emit('newToDO',result);
    
}


app.post("/todos", function (req, res) {
    console.log(req.body);
    var newToDo = new ToDo({"description":req.body.description, "tags":req.body.tags});
    newToDo.save(function (err, result) {
        if (err !== null) {
            // the element did not get saved!
            console.log(err);
            res.send("ERROR");
        } else {
            // our client expects *all* of the todo items to be returned, so we'll do
            // an additional request to maintain compatibility
            ToDo.find({}, function (err, result) {
                if (err !== null) {
                    // the element did not get saved!
                    res.send("ERROR");
                }
                //Sending update to all users
                sendToAll(result);
                res.json(result);
            });
        }
    });
});






