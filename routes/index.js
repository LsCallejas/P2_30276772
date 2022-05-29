const express = require('express');
const router = express.Router();
const sqlite3=require('sqlite3').verbose();
const path = require('path');
const XMLHttpRequest = require('xhr2');
const { RecaptchaV3 } = require('express-recaptcha')
const SECRET_KEY = '6LcMTCcgAAAAALDQESK1w5bDq8jE6ssGfKaS5pSD';
const SITE_KEY ='6LcMTCcgAAAAAPR3zsz63HZX70cws2TU6AHtmJG8';
const recaptcha = new RecaptchaV3(SITE_KEY, SECRET_KEY)
require('dotenv').config() 


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
			res.render("contactos.ejs", { SITE_KEY, SECRET_KEY },{datos:rows});
			}
	})
})





router.post('/', recaptcha.middleware.verify, function (req,res){
	if (!req.recaptcha.error) {

	
	
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

	  var XMLHttp = new XMLHttpRequest();
			XMLHttp.onreadystatechange = function(){
			if(this.readyState == 4 && this.status == 200) {
				var ipwhois = JSON.parse(this.responseText); 
				var country = ipwhois.country 
				var countryCode =  ipwhois.country_code
				var clientCountry = country + '(' + countryCode + ')'

	const sql="INSERT INTO contactos(nombre, email, comentario, fecha ,ip,country) VALUES (?,?,?,?,?,?)";
	const nuevos_mensajes=[req.body.nombre, req.body.email, req.body.comentario,fecha,ip,clientCountry];
	bd.run(sql, nuevos_mensajes, err =>{
	if (err){
		return console.error(err.message);
	}
	else{
		res.redirect("/");
		
		}
	})
	let transporter = nodemailer.createTransport({
		host: "smtp.hostinger.com",
			secureConnection: false,
			port: 465, 
			tls: {
				   ciphers:'SSLv3'
			},
			auth: {
				user: 'test009@arodu.dev',
				pass: 'eMail.test009'
			}
		});
			const customerMessage = `
				<p>Programacion P2</p>
				<h3>Información del Cliente/Contacto:</h3>
				<ul>
				  <li>Email: ${email}</li>
				  <li>Nombre: ${nombre}</li>
				  <li>Comentario: ${comentario}</li>
				  <li>Fecha: ${fecha}</li>
				<li>IP: ${ip}</li>
				<li>Pais: ${clientCountry}</li>
				</ul>`;

			const receiverAndTransmitter = {
				from: 'test009@arodu.dev',
				to: 'lscallejas14@gmail.com',
				subject: 'enviado desde leidy-p2', 
				html: customerMessage
			};
			transporter.sendMail(receiverAndTransmitter,(err, info) => {
				if(err)
					console.log(err)
				else
					console.log(info);
				})
			}
		};

XMLHttp.open('GET', 'https://ipwho.is/' + ip, true); 
	XMLHttp.send();	
   }
   else {
        
        res.redirect('/')
		
    }
});



router.get('/',(req,res)=>{
	res.render('index.ejs',{datos:{}})
	
});



module.exports = router;






