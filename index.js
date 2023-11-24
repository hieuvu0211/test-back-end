const express = require('express');
const mysql2 = require('mysql2');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
app.use(cors());
app.use(express.json());

const db = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: '02112003',
    database: 'web_manga'
});
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
});
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Specify the folder where files will be uploaded
    },
    filename: (req, file, cb) => {
      cb(null, `${file.originalname}`);
    },
  });

app.get('/test' , (req, res) => {
    const imageDirectory = `/public/test`;
    fs.readdir(imageDirectory, (err, files) => {
        if (err) {
          console.error('Error reading image directory:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        const imagePaths = files.map(file => path.join(imageDirectory, file));
        res.json(imagePaths);
    });
    // res.json({imagePaths : `/test`});
});


app.get('/api', (req, res) => {
    res.send('Hello World!');
});

app.get('/api/users', (req, res) => {
    const query = "select * from user";
    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        }
        return res.json(result);
    });
});

app.get('/api/users/:id', (req, res) => {
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

app.post('/api/users', (req, res) => {
    const query = "insert into user (`avatar`, `email`, `full_name`, `password`, `role`, `username`) values (?,?,?,?,?,?)";
    const values = [
        req.body.avatar,
        req.body.email,
        req.body.full_name,
        req.body.password,
        req.body.role,
        req.body.username
    ]
    // console.log("data = ", values);
    db.query(query, values, (err, result) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
            console.log("failed to create new user")
        }
        return res.json(result);
    });
});

app.delete('/api/users/:id', (req, res) => {
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

app.post('/api/users/:id', (req, res) => {
    const query = `update user set avatar =?, email =?, full_name=?, password=?, role=?, username=?  where id = ${req.params.id}`;
    const values = [
        req.body.avatar,
        req.body.email,
        req.body.full_name,
        req.body.password,
        req.body.role,
        req.body.username
    ]
    db.query(query, values, (err, result) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        }
        return res.json(result);
    });
});

app.get('/api/manga', (req, res) => {
    const query = "select * from book";
    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        }
        return res.json(result);
    });
});

app.post('/api/manga/:id', (req, res) => {
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
})

app.delete('/api/manga/:id', (req, res) => {
    const userId = req.params.id;
    const query = `delete from book where id = ${req.params.id}`;
    const delete_book_category = `delete from book_category where book_id = ${req.params.id}`;
    const delete_chapter = `delete from chapter where book_id = ${req.params.id}`;
    db.query(delete_chapter, (err, result) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        }
        else {
            console.log("chapter deleted successfully")
        }
    });
    db.query(delete_book_category, (err, result) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        }
        else {
            console.log("book_category deleted successfully")
        }
    });
    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        }
        return res.json(result);
    });
})

app.post('/api/manga' , (req, res) => {
    const query = "insert into book (`release_date`, `upload_at`, `cover_image`, `author`, `description`, `title`) values (?,?,?,?,?,?)";
    const values = [
        req.body.release_date,
        req.body.upload_at,
        req.body.cover_image,
        req.body.author,
        req.body.description,
        req.body.title
    ]
    // console.log("data = ", values);
    db.query(query, values, (err, result) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
            res.send("ailed to create new manga")
            console.log("failed to create new manga")
        }
        return res.json(result);
    });
});
app.get('/image', (req, res) => {
        const imageName = 'The_death.png'; // Tên ảnh hoặc đường dẫn ảnh tại đây
        res.json({ imagePath: `/images/${imageName}` });
});

app.get('/manga/:name', (req, res) => {
    res.send(req.params.name);
    
});
app.get('/manga/:name/:chapter', (req, res) => {
    const imageDirectory = `/public/manga/${req.params.name}/${req.params.chapter}`;
    res.send(req.params.chapter);
    fs.readdir(imageDirectory, (err, files) => {
        if (err) {
          console.error('Error reading image directory:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        const imagePaths = files.map(file => path.join(imageDirectory, file));
        res.json(imagePaths);
    });
})


const port = 8000;

app.listen(port, () => {
    console.log(`Server running on port: http://localhost:${port}`);
});