const express = require("express");
const app = express();
const fs = require("fs");
var bodyParser = require('body-parser');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: 'false'}));
app.use(bodyParser.json());

const dbFile = "./.data/sqlite.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);


var enableCORS = function(req, res, next) {
  if (!process.env.DISABLE_XORIGIN) {
    var allowedOrigins = ['*'];
    var origin = req.headers.origin;
    if(!process.env.XORIGIN_RESTRICT || allowedOrigins.indexOf(origin) > -1) {
      console.log(req.method);
      res.set({
        "Access-Control-Allow-Origin" : origin,
        "Access-Control-Allow-Methods" : "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers" : "Origin, X-Requested-With, Content-Type, Accept"
      });
    }
  }
  next();
};



db.serialize(() => {
  if (!exists) {
    db.run(
      //"CREATE TABLE Pessoa (idpessoa INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, idade INTEGER, sexo TEXT)"
      
    "CREATE TABLE Profissao (idprof INTEGER PRIMARY KEY AUTOINCREMENT, ocupacao TEXT, empresa TEXT, salariomedio FLOAT, idpessoa INTEGER FOREIGN KEY REFERENCES Pessoa(idpessoa))"
    
    
    );
    console.log("New table Pessoa created!");

    db.serialize(() => {
      db.run(
        //'INSERT INTO Pessoa (nome, idade, sexo) VALUES ("Beatriz Trindade", 17, "feminino"), ("Vanessa Reis", 36, "feminino"), ("Pedro Henrique Ferreira", 21, "masculino"), ("Renan Felliphe de Moura", 18, "masculino"), ("Gabriel Oliveira", 32, "masculino")'
        'INSERT INTO Profissao (ocupacao, empresa, salariomedio, idpessoa) VALUES ("Programador","Energisa","5.861,00", 1), ("Engenheiro Elétrico","Energisa","8.911,00",3), ("Atendente de Caixa","Supermercado Bahamas","1334,00", 2), ("Estagiário","RBM Web","733,83", 4), ("Professor","Sheffield Idiomas","5000,00", 5)'
      );
    });
  } else {
    console.log('Database "Pessoa" ready to go!');
    db.each("SELECT * from Pessoa", (err, row) => {
      if (row) {
        console.log(`record: ${row.nome}`);
      }
    });
  }
});

app.get("/", function(req, res) {
  res.send("REST API - Node JS + SQLITE");
});


app.get("/Pessoa", function(req, res) {
  if(req.query.idade){
    console.log(`select Pessoa where idade= ${req.query.idade}`);
    db.all(`SELECT * from Pessoa WHERE idade=${req.query.idade}`, (err, rows) => {
      res.json(rows);
    }); 
  }else{
    console.log("select all Pessoas");
    db.all("SELECT * from Pessoa", (err, rows) => {
      res.set('content-type', 'application/json; charset=utf-8')
      res.json(rows);
    }); 
  }
});

app.get("/Pessoa/:idpessoa", function(req, res) {
  console.log(`select Pessoa ${req.params.idpessoa}`);
  db.all(`SELECT * from Pessoa WHERE idpessoa=${req.params.idpessoa}` , (err, rows) => {
  res.json(rows);
  });  
});

app.post("/Pessoa", (request, response) => {
  console.log(`insert Pessoa ${request.body.nome}`);

  if (!process.env.DISALLOW_WRITE) {
    const data = request.body;
    db.run("INSERT INTO Pessoa (nome, idade, sexo) VALUES (?,?,?)", data.nome,data.idade,data.sexo, error => {
      if (error) {
        response.send({ message: "error!" });
      } else {
        response.send({ message: "success" });
      }
    });
  }
});

app.put("/Pessoa/:idpessoa", (request, response) => {
  console.log(`update Pessoa ${request.params.idpessoa}`);

  if (!process.env.DISALLOW_WRITE) {
    const data = request.body;
    db.run("UPDATE Pessoa SET nome=?, idade=?, sexo=? WHERE idpessoa=?", data.nome,data.idade,data.sexo, request.params.idpessoa, error => {
      if (error) {
        response.send({ message: "error!" });
      } else {
        response.send({ message: "success" });
      }
    });
  }
});

app.delete("/Pessoa/:idpessoa", (request, response) => {
  console.log(`delete Pessoa ${request.params.idpessoa}`);
  
  db.run("DELETE FROM Pessoa WHERE IDPessoa=?", request.params.idpessoa, error => {
      if (error) {
        response.send({ message: "error!" });
      } else {
        response.send({ message: "success" });
      }
    });
  
});

app.get("/clearPessoa", (request, response) => {
  console.log("delete all Pessoas");
  
  if (!process.env.DISALLOW_WRITE) {
    db.each(
      "SELECT * from Pessoa",
      (err, row) => {
        console.log("row", row);
        db.run(`DELETE FROM Pessoa WHERE IDPessoa=?`, row.idpessoa, error => {
          if (row) {
            console.log(`deleted row ${row.idpessoa}`);
          }
        });
      },
      err => {
        if (err) {
          response.send({ message: "error!" });
        } else {
          response.send({ message: "success" });
        }
      }
    );
  }
});


app.get("/Profissao", function(req, res) {
  if(req.query.empresa){
    console.log(`select Profissao where empresa= ${req.query.empresa}`);
    db.all(`SELECT * from Profissao WHERE empresa=${req.query.empresa}`, (err, rows) => {
      res.json(rows);
    }); 
  }else{
    console.log("select all Profissoes");
    db.all("SELECT * from Profissao", (err, rows) => {
      res.set('content-type', 'application/json; charset=utf-8')
      res.json(rows);
    }); 
  }
});

app.get("/Profissao/:idprof", function(req, res) {
  console.log(`select profissao ${req.params.idprof}`);
  db.all(`SELECT * from Profissao WHERE idprof=${req.params.idprof}` , (err, rows) => {
  res.json(rows);
  });  
});

app.post("/Profissao", (request, response) => {
  console.log(`insert Profissao ${request.body.ocupacao}`);

  if (!process.env.DISALLOW_WRITE) {
    const data = request.body;
    db.run("INSERT INTO Profissao (ocupacao, empresa, salariomedio, idpessoa) VALUES (?,?,?,?)", data.ocupacao,data.empresa,data.salariomedio,data.idpessoa, error => {
      if (error) {
        response.send({ message: "error!" });
      } else {
        response.send({ message: "success" });
      }
    });
  }
});

app.put("/Profissao/:idprof", (request, response) => {
  console.log(`update Profissao ${request.params.idprof}`);

  if (!process.env.DISALLOW_WRITE) {
    const data = request.body;
    db.run("UPDATE Profissao SET ocupacao=?, empresa=?, salariomedio=?, idpessoa=? WHERE idprof=?", data.ocupacao,data.empresa,data.salariomedio,data.idpessoa, request.params.idprof, error => {
      if (error) {
        response.send({ message: "error!" });
      } else {
        response.send({ message: "success" });
      }
    });
  }
});

app.delete("/Profissao/:idprof", (request, response) => {
  console.log(`delete Profissao ${request.params.idprof}`);
  
  db.run("DELETE FROM Profissao WHERE IDProf=?", request.params.idprof, error => {
      if (error) {
        response.send({ message: "error!" });
      } else {
        response.send({ message: "success" });
      }
    });
  
});

app.get("/clearProfissao", (request, response) => {
  console.log("delete all Profissoes");
  
  if (!process.env.DISALLOW_WRITE) {
    db.each(
      "SELECT * from Profissao",
      (err, row) => {
        console.log("row", row);
        db.run(`DELETE FROM Profissao WHERE IDProf=?`, row.idprof, error => {
          if (row) {
            console.log(`deleted row ${row.idprof}`);
          }
        });
      },
      err => {
        if (err) {
          response.send({ message: "error!" });
        } else {
          response.send({ message: "success" });
        }
      }
    );
  }
});


const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});