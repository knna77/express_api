// Create express app
var express = require("express")
var app = express()
//Importem la base de dades
var db = require("./database.js")
var fs = require('fs');
var https = require('https');
//HTTP utilitzat serà POST per a enviar les dades en les capçaleres i no a través de la URL
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var cookieParser = require('cookie-parser');
var path = require('path');
//--------------------------------------------------------------------------------------Token
// To support URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// To parse cookies from the HTTP Request
app.use(cookieParser());

const jwt = require('jsonwebtoken');
const accessTokenSecret="hola"; 
  
//--------------------------------------------------------------------------------------
//importem md5
var md5 = require('md5')
// Server port
var PORT = 8443
// Start server hhtp
/*app.listen(PORT, () => {
    console.log("Servidor escoltant a l'adreça http://localhost:%PORT%".replace("%PORT%",PORT))
});*/
// Start server hhtps
https.createServer({
    key: fs.readFileSync('my_cert.key'),
    cert: fs.readFileSync('my_cert.crt')
  }, app).listen(PORT, function(){
    console.log("My HTTPS server listening on port " + PORT + "...");
  });

//entrada 
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'formulario/entrar.html'));
  });
  app.get('api/home', function(req, res) {
    res.sendFile(path.join(__dirname, 'formulario/entrar.html'));
  });

//llista d'usuaris
app.get("/api/users", (req, res, next) => {
    var sql = "select * from user"
    var params = []
    db.all(sql, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});
//usuari per id
app.get("/api/user/:id", (req, res, next) => {
    var sql = "select * from user where id = " + req.params.id
    //console.log("---"+sql.length);
    var iden = req.params.id
    //console.log("---"+iden.length);
    var maxValue = sql.length + 4;

    var llega=sql.length+iden.length;
    console.log("maxValue---"+maxValue);
    console.log("llega---"+llega);
    
    if (llega<maxValue){

    db.get(sql, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
        }else{
            res.json({
                "message":"success",
                "data":row
            })
        }
      });
    }else{
        res.json({
            "message":"¡¡¡¡Alarma sqlInjection!!!!",
           
        })
    }
});

//Afegir usuari per postman 

app.post("/api/user/", (req, res, next) => {
    var errors=[]
    if (!req.body.password){
        errors.push("No password specified");
    }
    if (!req.body.email){
        errors.push("No email specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        name: req.body.name,
        email: req.body.email,
        password : req.body.password ? md5(req.body.password) : null,
        role : 'user'
      
    }
    var sql ='INSERT INTO user (name, email, password, role) VALUES (?,?,?,?)'
    var params =[data.name, data.email, md5(data.password)]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})
//ACTUALITZAR USUARI PER ID (curl o postman)

app.patch("/api/user/:id", (req, res, next) => {
    var data = {
        name: req.body.name,
        email: req.body.email,
        password : req.body.password ? md5(req.body.password) : null,
        role : 'user'
    }
    db.run(
        `UPDATE user set 
           name = COALESCE(?,name), 
           email = COALESCE(?,email), 
           password = COALESCE(?,password),
           role = COALESCE(?,role),
           WHERE id = ?`,
        [data.name, data.email, data.password, req.params.id],
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                console.error("no funciona")
                return;
            }
            res.json({
                message: "success",
                data: data,
                changes: this.changes
            })
    });
})

//borrar usuari per id
app.delete("/api/user/:id", (req, res, next) => {
    var sql = "DELETE FROM user WHERE id = " + req.params.id

   //console.log("---"+sql.length);
   var iden = req.params.id
   //console.log("---"+iden.length);
   var maxValue = sql.length + 4;
   console.log("2--"+ iden);
   var llega=sql.length+iden.length;
   //console.log("maxValue---"+maxValue);
   //console.log("llega---"+llega);
   
   if (iden==NaN){
   
    db.get(sql, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
        }else{
            res.json({
                "message":"borrado",
                "data":row
            })
        }
      });
    }else{
        res.json({
            "message":"¡¡¡¡Alarma sqlInjection!!!!",
           
        })
    }   
});

//-----------------------------------------------------------------------------------------------Formularios
//Registrar
//especificamos el subdirectorio donde se encuentran las páginas estáticas
app.use(express.static('/formulario'));
//extended: false significa que parsea solo string (no archivos de imagenes por ejemplo)
app.use(bodyParser.urlencoded({ extended: false }));
//registrar usuario formulario
app.post('/api/registra_usuario', (req, res, next) => {
    var errors=[]
    if (!req.body.pass){
        errors.push("No password specified");
    }
    if (!req.body.mail){
        errors.push("No email specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        name: req.body.name,
        email: req.body.mail,
        password : req.body.pass 
    }
    var sql ='INSERT INTO user (name, email, password) VALUES (?,?,?)'
    var params =[data.name, data.email, data.password]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
        
    });
  })  
 
 //entrar
 
 app.post('/api/entra_usuario', (req, res, next) => {
   var sql = "select role from user where name = '"+req.body.name+"' and password = '"+ md5(req.body.pass)+"'"  
   
   const { username, password } = req.body;
  

    db.get(sql, (err, row) => {
       // console.log("----"+row)
        if (row==undefined) {
            //console.log("----2"+row)
            res.sendFile(path.join(__dirname, 'formulario/nologin.html'));
        }else{  
            const accessToken = jwt.sign({ username: req.body.name,  role: row.role }, accessTokenSecret, { expiresIn: '1m' });
            res.cookie('accessToken', accessToken);
            const decode = jwt.verify(accessToken, accessTokenSecret);
            console.log ("decode: "+decode)
            res.sendFile(path.join(__dirname, 'formulario/home.html'));     
        }
      });  
});
//verificar token-----------------------------------------------
app.get("/api/auth", (req, res) => {
    console.log("entra")
 
    // Get token value to the json body
    const token = req.body.token;
   
    // If the token is present
    if (token) {
   
      // Verify the token using jwt.verify method 
const decode = jwt.verify(token, accessTokenSecret);
   
      //  Return response with decode data
      res.json({
        login: true,
        data: decode,
      });
    } else {
   
      // Return response with error
      res.json({
        login: false,
        data: "error",
      });
    }
  });
   

// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});
// Insert here other API endpoints
// Default response for any other request
// Default response for any other request
app.use(function (req, res) {
    res.status(404).json({ "error": "Invalid endpoint" });
});  