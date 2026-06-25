
// import express from "express";
// import bodyParser from "body-parser";
// import pg from "pg";


// const app = express();
// const port = 9000;

// const db = new pg.Client({
//   user: "postgres",
//   host: "localhost",
//   database: "Authentication",
//   password: "KemfonAbasi@001",
//   port: 5432,
// });
// db.connect();

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("public"));

// app.get("/", (req, res) => {
//   res.render("home.ejs");
// });

// app.get("/login", (req, res) => {
//   res.render("login.ejs");
// });

// app.get("/register", (req, res) => {
//   res.render("register.ejs");
// });

// app.post("/register", async (req, res) => {
//   const firstname = req.body.userfname;
//   const lastname = req.body.userlname;
//   const emailadd = req.body.emailaddress;
//   const password = req.body.passworddetails;
//   const confirmpassword = req.body.userCPassword;

//   // Check password and confirm password match BEFORE touching the database
//   if (password !== confirmpassword) {
//     return res.send("Passwords do not match. Please go back and try again.");
//   }

//   try {
//     const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
//       emailadd,
//     ]);

//     if (checkResult.rows.length > 0) {
//       res.send("Email already exists. Try logging in.");
//     } else {
//       const result = await db.query(
//         "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)",
//         [firstname, lastname, emailadd, password]
//       );
//       res.render("secrets.ejs");
//     }
//   } catch (err) {
//     console.log(err);
//     res.send("Something went wrong. Please try again.");
//   }
// });

// app.post("/login", async (req, res) => {
//   const emailadd = req.body.emailaddress;
//   const password = req.body.passworddetails;

//   try {
//     const result = await db.query("SELECT * FROM users WHERE email = $1", [
//       emailadd,
//     ]);
//     if (result.rows.length > 0) {
//       const user = result.rows[0];
//       const storedPassword = user.password;

//       if (password === storedPassword) {
//         res.render("secrets.ejs");
//       } else {
//         res.send("Incorrect Password");
//       }
//     } else {
//       res.send("User not found");
//     }
//   } catch (err) {
//     console.log(err);
//   }
// });

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });




import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";


const app = express();
const port = 9000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Authentication",
  password: "KemfonAbasi@001",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

const saltRounds = 2;

app.post("/register", async (req, res) => {
  const firstname = req.body.userfname;
  const lastname = req.body.userlname;
  const emailadd = req.body.emailaddress;
  const password = req.body.passworddetails;
  const confirmpassword = req.body.userCPassword;

  if (password !== confirmpassword) {
    return res.send("Passwords do not match. Please go back and try again.");
  }

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      emailadd,
    ]);

    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in.");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.log("Error hashing password:", err);
          return res.send("Something went wrong. Please try again.");
        }
        const result = await db.query(
          "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)",
          [firstname, lastname, emailadd, hash]
        );
        res.render("secrets.ejs");
      });
    }
  } catch (err) {
    console.log(err);
    res.send("Something went wrong. Please try again.");
  }
});




app.post("/login", async (req, res) => {
  const emailadd = req.body.emailaddress;
  const password = req.body.passworddetails;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      emailadd,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedHashedPassword = user.password;

      bcrypt.compare(password, storedHashedPassword, (err, valid) => {
        if (err) {
          console.log("Error comparing passwords:", err);
          return res.send("Something went wrong. Please try again.");
        }
        if (valid) {
          res.render("secrets.ejs");
        } else {
          res.send("Incorrect Password");
        }
      });
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});