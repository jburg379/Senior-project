// Importing libraries
const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const sessions = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
bcrypt = require('bcrypt');


let port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

// Connect to the database
let db = new sqlite3.Database('hub2.db', (err) => {
    if (err) {
        console.log(err.message);
        throw err;
    }
});

// Start the server
app.listen(port, () => {
    console.log("Server running");
});

// Set up session
const log_time = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "this_is_my_k3y",
    saveUninitialized: true,
    cookie: {maxAge: log_time},
    resave: false
}));

// Routes
app.get("/", (req, res) => {
    let user= req.session.user;

    if(user != null) {
        res.redirect("/welcome");
    }
    else {
        res.sendFile(__dirname + "/index.html");
    }
});

//Begin customer page
app.get("/customer", (req, res) => {
    let user= req.session.user;

    if(user != null) {
        res.redirect("/welcome");
    }
    else{
        res.sendFile(__dirname + "/customer.html");
    }
});

app.get("/api/customer", (req, res) => {
    let sql = "SELECT business_id, b_name, phone, o_hours, c_hours, street, city, stte FROM business b inner join adress a on b.address_id = a.address_id";
    let params = [];
    db.all(sql, params, (err, rows) => {
        if(err) {
            res.status(400);
            res.json({"error": err.message});
        }
        else {
            res.status(200);
            res.json(rows);
            res.end();
        }
    });
});

app.get("/api/customer/:value", (req, res) => {
    let sql = "SELECT business_id, b_name, phone, o_hours, c_hours, street, city, stte FROM business b inner join adress a on b.address_id = a.address_id WHERE b.b_name LIKE ?";
    let params = ['%' + req.params.value + '%'];
    db.all(sql, params, (err, rows) => {
        if(err) {
            res.status(400);
            res.json({"error": err.message});
        }
        else {
            res.json(rows);
            res.end();
        }
    });
    
});

app.post("/api/customer", (req, res) => {
    let sql = "INSERT INTO appointment (day, month, year, first_name, last_name, phone, start_time, end_time, business_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    let params = [req.body.day, req.body.month, req.body.year, req.body.first_name, req.body.last_name, req.body.phone, req.body.start_time, req.body.end_time, req.body.business_id];

    db.run(sql, params, (err, rows) => {
        if(err) {
            res.status(400);
            res.json({"error": err.message});
        }
        else {
            res.status(200);
            console.log("Appointment made");
        }
    });
});

// Begin create profile
app.get("/business_make_profile.html", (req, res) => {
    let user= req.session.user;

    if(user != null) {
        res.redirect("/welcome");
    }
    else {
        res.sendFile(__dirname + "/business_make_profile.html");
    }
});

app.post("/make_profile", async (req, res) => {
    
    let sql2 = "INSERT INTO adress (street, city, stte, zip_code) VALUES (?,?,?,?) RETURNING address_id";
    let params2 = [req.body.street, req.body.city, req.body.state, req.body.zip_code];

    db.all(sql2, params2, async (err, rows) => {
        if (err) {
            res.status(400);
            res.json({"error": err.message});
        }
        else {
            let sql = "INSERT INTO business (username, passwrd, email, b_name, phone, o_hours, c_hours, address_id) VALUES (?,?,?,?,?,?,?,?)";
            let hashedPass = await bcrypt.hash(req.body.pass, 10)
            let params = [req.body.username, hashedPass, req.body.b_email, req.body.b_name, req.body.b_phone, req.body.s_hours_open, req.body.s_hours_close, rows[0].address_id];
            db.run(sql, params, (err) => {
                if (err) {
                    res.status(400);
                    res.json({"error": err.message});
                }
                else {
                    res.status(201);
                    console.log("data has been submitted")
                }
            })
            res.end();
        }
    })
    
    res.sendFile(__dirname + "/profile_created.html");
});

//Begin business login and forgot password
app.get("/business_login.html", (req,res) => {
    let user= req.session.user;

    if(user != null) {
        res.redirect("/welcome");
    }

    else {
        res.sendFile(__dirname + "/business_login.html");
    }
});

app.get("/forgot_password.html", (req, res) => {
    res.sendFile(__dirname + "/forgot_password.html");
});

app.post("/login", (req,res) => {
    let email = req.body.email;
    let password = req.body.pass;

    if(email && password){
        db.all("SELECT * FROM business WHERE email = ?", email, async (err, results) => {
            if(err) {
                throw err;
            }
            if(results.length > 0) {
                const isValid = await bcrypt.compare(password, results[0].passwrd)

                if(!isValid) {
                    res.redirect("/incorrect_password");
                } else {
                    req.session.userId = results[0].business_id;
                    req.session.user = results[0].username;
                    res.redirect("/welcome");
                }
            }
            else{
                res.redirect("/incorrect_email");
            }
            res.end();
        });
    } else {
        res.send("Enter username and password!");
        res.end();
    }
});

app.get("/incorrect_password", (req, res) => {
    res.sendFile(__dirname + "/incorrect_password.html");
});

app.get("/incorrect_email", (req, res) =>{
    res.sendFile(__dirname + "/incorrect_email.html");
});

app.get("/business_exists", (req, res) => {
    res.sendFile(__dirname + "/business_already_made.html");
});

app.use(express.static(path.join(__dirname, 'public')));

app.get("/logout", (req, res) => {
    req.session.destroy(function(err) {
        res.redirect("/business_login.html");
    })
});

//Begin business view
app.get("/welcome", (req, res) => {
    res.sendFile(__dirname + "/business_view.html");
});

app.post("/api/appointment", (req, res) => {
    b_id = req.session.userId;

    if(req.body !== []) {
        
        req.body.forEach((x) => {
            let day = x.day;
            let month = x.month;
            let year = x.year;
            let events = x.events;
            
            events.forEach((e) => {
                let cus_name = e.customer.split(' ');
                let f_name = cus_name[0];
                let l_name = cus_name[1];
                let phone = e.phone;
                let from = e.from;
                let end = e.end;

                let sql = "INSERT INTO appointment (day, month, year, first_name, last_name, phone, start_time, end_time, business_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                let params = [day, month, year, f_name, l_name, phone, from, end, b_id];

                
                db.run(sql, params, (err) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log("data has been submitted")
                    }
                })
            })
        }
        );
    }
    res.status(201);
    res.end();
});

app.get("/api/appointment", (req, res) => {
    let b_id = req.session.userId;
    

    let sql = "SELECT * FROM appointment WHERE business_id = ? ORDER BY (case when start_time like '% AM' then 1 else 2 end), CAST(start_time as INTEGER)";
    let params = [b_id];
    
    db.all(sql, params, (err, rows) => {
        if(err){
            res.status(400);
            res.json({"error": err.message});
        }
        else {
            let mapping = new Map();
            rows.forEach( (x) => {
                let key = [x.day, x.month, x.year];
                let value = mapping.get(key);
                if (value) {
                    mapping.set(key, value.push({
                        customer: x.first_name + ' ' + x.last_name,
                        phone: x.phone,
                        from: x.start_time,
                        end: x.end_time
                    }));
                }
                else {
                    mapping.set(key, [{
                        customer: x.first_name + ' ' + x.last_name,
                        phone: x.phone,
                        from: x.start_time,
                        end: x.end_time
                    }]);
                }
            })
 
            let events = [];
            mapping.forEach( (value, key, map) => {
                events.push({
                    day: key[0],
                    month: key[1],
                    year: key[2],
                    events: value
                })
            })
            res.json(events);
            res.end();
        }
    })
});

app.delete("/api/appointment", (req, res) => {
    
    if(req.body !== []){
        let day = req.body[0].day;
        let month = req.body[0].month;
        let year = req.body[0].year;
        let customer = req.body[1].customer.split(' ');
        let f_name = customer[0];
        let l_name = customer[1];
        let from = req.body[1].from;
        let end = req.body[1].end;
        
        let sql = "DELETE FROM appointment WHERE day = ? AND month = ? AND year = ? AND first_name = ? AND last_name = ? AND start_time = ? AND end_time = ?";
        let params = [day, month, year, f_name, l_name, from, end];

        db.run(sql, params, (err) =>{
            if(err){
                req.status(404);
                req.json({"error": err.message});
            }
            else{
                console.log("data deleted");
                res.end
            }
        });
    }
});

// Begin Edit Profile set up
app.get("/business_edit_profile.html", (req, res) => {
    let user= req.session.user;

    if(user != null) {
        res.sendFile(__dirname + "/business_edit_profile.html");
    }

    else {
        res.redirect("/business_login.html");
    }
});

app.put("/api/edit_profile/phone", (req, res) => {
    let id = req.session.userId;

    let sql = "UPDATE business SET phone=? WHERE business_id=?";
    let params = [req.body.phone, id];
    db.run(sql, params, (err) => {
        if (err) {
            res.status(400);
            res.json({"error": err.message});
        }
        else {
            res.status(200);
            res.end();
        }
    });
});

app.put("/api/edit_profile/hours", (req, res) => {
    let id = req.session.userId;

    let sql = "UPDATE business SET o_hours=?, c_hours=? WHERE business_id=?";
    let params = [req.body.o_hours, req.body.c_hours, id];
    db.run(sql, params, (err) => {
        if (err) {
            res.status(400);
            res.json({"error": err.message});
        }
        else {
            res.status(200);
            res.end();
        }
    });
});

app.put("/api/edit_profile/address", (req, res) => {
    let id = req.session.userId;

    let sql = "SELECT address_id FROM business WHERE business_id=?";
    let params = [id];

    db.all(sql, params, (err, rows) => {
        if(err) {
            res.status(400);
            res.json({"error": err.message});
        }
        else{
            let sql2 = "UPDATE adress SET street=?, city=?, stte=?, zip_code=? WHERE address_id=?";
            let params2 = [req.body.street, req.body.city, req.body.state, req.body.zip, rows[0].address_id];
            db.run(sql2, params2, (err) => {
                if (err) {
                    res.status(400);
                    res.json({"error": err.message});
                }
                else {
                    res.status(200);
                    res.end();
                }
            })
        }
    })
});