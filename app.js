const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const app = express();
const _ = require("lodash");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://admin-harshanth:tinkle102@cluster0.irlxv.mongodb.net/ToDoListDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const day = date.getDate();
const itemsSchema = {
  name: String,
};
const Item = mongoose.model("ITEM", itemsSchema);
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
const item1 = new Item({
  name: "nice",
});
const item2 = new Item({
  name: "press the + button to add stuff",
});
const defaultItems = [item1, item2];

const listSchema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("LIST", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("dun");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: day, newListItems: foundItems });
    }
  });
});
app.post("/delete", (req, res) => {
  const checkedItemId = _.capitalize(req.body.checkBox)
  const listName = req.body.listName;
  if (listName === day) {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (err) {
        console.log(err);
      } else res.redirect("/");
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      (err, foundList) => {
        if (!err) {
          res.redirect("/"+ listName)     
        }
      }
    );
  }

  // res.redirect("/")
});

app.get("/:customListName", (req, res) => {
  const customListName = req.params.customListName;
  List.findOne({ name: customListName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        // create a new list
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect(`/${customListName}`);
      } else {
        // show the existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});
app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});
app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT|| 3000, function () {
  console.log("Server started on port 3000");
});
