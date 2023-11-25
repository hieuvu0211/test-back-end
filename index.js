const express = require("express");
const mysql2 = require("mysql2");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const app = express();
app.use(cors());
app.use(express.json());

const db = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "02112003",
  database: "web_manga",
});
db.connect((err) => {
  if (err) throw err;
  console.log("Connected to database");
});
app.use(express.static(path.join(__dirname, "public")));

app.get("/api", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/users", (req, res) => {
  const query = "select * from user";
  db.query(query, (err, result) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    }
    return res.json(result);
  });
});

app.get("/api/users/:id", (req, res) => {
  let i = req.params.id;
  const query = "select * from user where id =  ?";
  db.query(query, [i], (err, result) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    }
    return res.json(result);
  });
});

app.post("/api/users", (req, res) => {
  const query =
    "insert into user (`avatar`, `email`, `full_name`, `password`, `role`, `username`) values (?,?,?,?,?,?)";
  const values = [
    req.body.avatar,
    req.body.email,
    req.body.full_name,
    req.body.password,
    req.body.role,
    req.body.username,
  ];
  // console.log("data = ", values);
  db.query(query, values, (err, result) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      console.log("failed to create new user");
    }
    return res.json(result);
  });
});

app.delete("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  const query = "delete from user where id =?";
  db.query(query, [userId], (err, result) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    }
    return res.json(result);
  });
});

app.post("/api/users/:id", (req, res) => {
  const query = `update user set avatar =?, email =?, full_name=?, password=?, role=?, username=?  where id = ${req.params.id}`;
  const values = [
    req.body.avatar,
    req.body.email,
    req.body.full_name,
    req.body.password,
    req.body.role,
    req.body.username,
  ];
  db.query(query, values, (err, result) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    }
    return res.json(result);
  });
});

app.get("/api/manga", (req, res) => {
  const query = "select * from book";
  db.query(query, (err, result) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    }
    return res.json(result);
  });
});

app.post("/api/manga/:id", (req, res) => {
  const sql = `update book set release_date =?, upload_at =?, cover_image=?, author=?, description=?, title=?
     where id = ${req.params.id}`;
  const values = [
    req.body.release_date,
    req.body.upload_at,
    req.body.cover_image,
    req.body.author,
    req.body.description,
    req.body.title,
  ];
  db.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    }
    return res.json(result);
  });
});

app.delete("/api/manga/:id", (req, res) => {
  const userId = req.params.id;
  const query = `delete from book where id = ${req.params.id}`;
  const delete_book_category = `delete from book_category where book_id = ${req.params.id}`;
  const delete_chapter = `delete from chapter where book_id = ${req.params.id}`;
  db.query(delete_chapter, (err, result) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      console.log("chapter deleted successfully");
    }
  });
  db.query(delete_book_category, (err, result) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      console.log("book_category deleted successfully");
    }
  });
  db.query(query, (err, result) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    }
    return res.json(result);
  });
});

app.post("/api/manga", (req, res) => {
  const query =
    "insert into book (`release_date`, `upload_at`, `cover_image`, `author`, `description`, `title`) values (?,?,?,?,?,?)";
  const values = [
    req.body.release_date,
    req.body.upload_at,
    req.body.cover_image,
    req.body.author,
    req.body.description,
    req.body.title,
  ];
  // console.log("data = ", values);
  db.query(query, values, (err, result) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      res.send("ailed to create new manga");
      console.log("failed to create new manga");
    }
    return res.json(result);
  });
});

app.get("/:manga", (req, res) => {
  const countSubfolders = (folderPath) => {
    try {
      const subfolders = fs.readdirSync(folderPath);

      let folderCount = 0;

      subfolders.forEach((subfolder) => {
        const subfolderPath = path.join(folderPath, subfolder);
        const stat = fs.statSync(subfolderPath);
        if (stat.isDirectory()) {
          folderCount++;
        }
      });

      return folderCount;
    } catch (error) {
      console.error("Error counting subfolders:", error);
      return -1;
    }
  };

  const mainFolderPath = `./public/manga/${req.params.manga}`;
  const subfolderCount = countSubfolders(mainFolderPath);

  if (subfolderCount !== -1) {
    return res.send({
      numberChapter: subfolderCount,
      imagePath: `http://localhost:8000/manga/${req.params.manga}/index.jpg`,
    });
  } else {
    res.send("Failed to count subfolders.");
  }
});
//get number of chapters in chapter folder
app.get("/:manga/:chapter", (req, res) => {
  const folder_path = `./public/manga/${req.params.manga}/${req.params.chapter}`;
  const countImagesInFolder = (folderPath) => {
    try {
      const files = fs.readdirSync(folderPath);
      const imageFiles = files.filter((file) =>
        /\.(jpg|jpeg|png|gif)$/i.test(path.extname(file))
      );

      return imageFiles.length;
    } catch (error) {
      console.error("Error counting images in folder:", error);
      return -1;
    }
  };
  const imageCount = countImagesInFolder(folder_path);
  if (imageCount !== -1) {
    return res.json({ number: imageCount });
  } else {
    res.send(`Failed to count images in the folder.`);
  }
});
app.get("/:manga/:chapter/:id", (req, res) => {
  res.json({
    imagePath: `http://localhost:8000/manga/${req.params.manga}/${req.params.chapter}/${req.params.id}.jpg`,
  });
});

const port = 8000;

app.listen(port, () => {
  console.log(`Server running on port: http://localhost:${port}`);
});
