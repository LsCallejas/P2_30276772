const express = require('express');
const router = express.Router();
const path = require('path');
const XMLHttpRequest = require('xhr2');
const fetch = require('node-fetch'); 

const nodemailer = require('nodemailer'); 
require('dotenv').config()

const sqlite3=require('sqlite3').verbose();

const basededatos=path.join(__dirname,"basededatos","basededatos.db");
const bd= new sqlite3.Database(basededatos, err =>{ 
if (err){
	return console.error(err.message);
}else{
	console.log("db only");
}
})

const create="CREATE TABLE IF NOT EXISTS contactos(email VARCHAR(20),nombre VARCHAR(20), comentario TEXT,fecha DATATIME,ip TEXT, country VARCHAR(20));";

bd.run(create,err=>{
	if (err){
	return console.error(err.message);
}else{
	console.log("table only");
}
})


router.get('/contactos',(req,res)=>{	
	const sql="SELECT * FROM contactos;";
	bd.all(sql, [],(err, rows)=>{
			if (err){
				return console.error(err.message);
			}else{
			res.render("contactos.ejs",{datos:rows},);
			}
		})
})

//Post del formulario de contactos
router.post('/',(req,res)=>{
	const name = req.body.name;
  	const SITE_KEY = process.env.SITE_KEY;
  	const SECRET_KEY = process.env.SECRET_KEY;
  	const url = 
	`https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${SITE_KEY}`;
  	fetch(url, {
    	method: "post",
  	})
    	.then((response) => response.json())
    	.then((google_response) => {
   
    	if (google_response.success == true) {	
  			var hoy = new Date();
			var horas = hoy.getHours();
			var minutos = hoy.getMinutes();
			var segundos = hoy.getSeconds()
			var hora = horas + ':' + minutos + ':' + segundos + ' '
			var fecha = hoy.getDate() + '-' + ( hoy.getMonth() + 1 ) + '-' + hoy.getFullYear() + '//' + hora;
			var ip = req.headers["x-forwarded-for"];
	  		if (ip){
    		var list = ip.split(",");
			ip= list[list.length-1];
		} else {
			ip = req.connection.remoteAddress;
  		}

	  	var xhr= new XMLHttpRequest();
	    xhr.onreadystatechange = function(){
		if(xhr.readyState == 4 && xhr.status == 200) {
			var ip = JSON.parse(xhr.responseText); 
			var country = ip.country 
			var countryCode =  ip.country_code
			var clientCountry = country + '(' + countryCode + ')'

	const sql="INSERT INTO contactos(nombre,email,comentario,fecha,ip,country) VALUES (?,?,?,?,?,?)";
	const nuevos_mensajes=[req.body.nombre,req.body.email,req.body.comentario,fecha,ip,clientCountry];
	bd.run(sql, nuevos_mensajes, err =>{
	if (err){
		return console.error(err.message);
	}
	else{
	    setTimeout(function(){
		res.redirect("/");
	}, 1800);
	}
})
let transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',                  // hostname
    service: 'outlook',                             // service name
    secureConnection: false,
    tls: {
        ciphers: 'SSLv3'                            // tls version
    },
    port: 25, 
  auth: {
    user: ' lscallejas14@outlook.com',
    pass: 'Salome10%',
  },
});
const Message = `
	 <p>Programacion P2 sec-1</p>
	 <h3>Información del Cliente</h3>
	 <ul>
	  <li>Email: ${req.body.email}</li>
	  <li>Nombre: ${req.body.nombre}</li>
	  <li>Comentario: ${req.body.comentario}</li>
	  <li>Fecha: ${fecha}</li>
	  <li>IP: ${ip}</li>
	  <li>Pais: ${clientCountry}</li>
	  </ul>`;

	const receiverAndTransmitter = {
		from: ' lscallejas14@outlook.com',
		to: 'programacion2ais@dispostable.com',
		subject: 'Informacion del Contacto', 
		html: Message
	};
	transporter.sendMail(receiverAndTransmitter,(err, info) => {
		if(err)
			console.log(err)
		else
			console.log(info);
		})
 	}
}; 
xhr.open('GET', 'http://ip-api.com/' + ip, true); 
xhr.send();
}else{

setTimeout(function(){ 
	res.redirect("/");				
}, 1800);
}
})

.catch((error) => {
return res.json({ error });
});
})

router.get('/',(req,res)=>{
	res.render('index.ejs',{datos:{},
	SITE_KEY:process.env.SITE_KEY,
	ID_ANALYTICS:'G-KXXMXLEBYF'
})
});

module.exports = router;






