// Create express app
var express = require("express")
var app = express()
//Importem la base de dades
var db = require("./database.js")
//HTTP utilitzat serà POST per a enviar les dades en les capçaleres i no a través de la URL
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//importem md5
var md5 = require('md5')
// Server port
var HTTP_PORT = 9000 
// Start server
app.listen(HTTP_PORT, () => {
    console.log("Servidor escoltant a l'adreça http://localhost:%PORT%".replace("%PORT%",HTTP_PORT))
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
            "message":"¡¡¡¡Alarmasq lInjection!!!!",
           
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
        password : req.body.password ? md5(req.body.password) : null
      
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
//ACTUALITZAR USUARI PER ID (curl o postman)

app.patch("/api/user/:id", (req, res, next) => {
    var data = {
        name: req.body.name,
        email: req.body.email,
        password : req.body.password ? md5(req.body.password) : null
    }
    db.run(
        `UPDATE user set 
           name = COALESCE(?,name), 
           email = COALESCE(?,email), 
           password = COALESCE(?,password) 
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

   var llega=sql.length+iden.length;
   console.log("maxValue---"+maxValue);
   console.log("llega---"+llega);
   
   if (llega<maxValue){
   
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
            "message":"¡¡¡¡Alarmasq lInjection!!!!",
           
        })
    }
    
});

//------------------------------------------------------------------------------------------------------
//especificamos el subdirectorio donde se encuentran las páginas estáticas
app.use(express.static(__dirname + '/formulario'));
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