var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var crypto = require('crypto');
var mysql = require('mysql');
var util = require('util');

app.use(bodyParser.json());

// Setup Database Connection
var pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "bradley",
    database: "anki"
});



var users = [];

app.get('/', function(req, res) {
    res.send('Home Page');
});

//  Returns all users
app.get('/api/users', function(req, res) {
    pool.query('SELECT username FROM users', function(err, rows, fields) {
	if (err) throw err;
	res.json(rows);
    });
});

// Creates a new user
app.post('/api/users', function(req, res) {
    if(!req.body.hasOwnProperty('username') || !req.body.hasOwnProperty('password') || !req.body.hasOwnProperty('email_address'))
    {
	res.statusCode = 400;
	return res.send('Error: Wrong POST Syntax');
    }
    // Check if username is already taken
    pool.query(util.format("SELECT username FROM users WHERE username='%s'", req.body.username), function(err, rows, fields) {
	if(rows.length != 0)
	{
	    res.statusCode = 403;
	    return res.send("Username is already taken");
	}
	
	// Insert new user into database
	var hash = crypto.createHash("sha1").update(req.body.password).digest('hex');
	var token = crypto.randomBytes(64).toString('hex');
	pool.query(util.format("INSERT INTO users (username, password, email_address, token) VALUES ('%s', '%s', '%s', '%s')", req.body.username, hash, req.body.email_address, token), function(err, rows, fields) {
	    if(err) throw err;
	}); 
	
	// Return generated token
	var tokenObj = {token:token}
	res.json(tokenObj);
    });
});

// Logs the User In
app.post('/api/login', function(req, res) {
    if(!req.body.hasOwnProperty('username') || !req.body.hasOwnProperty('password'))
    {
	res.statusCode = 400;
	return res.send("Error: Wrong POST Syntax")
    }

    // Check if the supplied username and password are correct
    var hash = crypto.createHash("sha1").update(req.body.password).digest('hex');
    pool.query(util.format("SELECT username FROM users WHERE username='%s'AND password='%s'", req.body.username, hash), function(err, rows, fields) {
	if(err) throw err;
	if(rows.length != 1)
	{
	    res.statusCode = 403;
	    return res.send("Incorrect username or password");
	}

	// Create new token and update database
	var token = crypto.randomBytes(64).toString('hex');
	pool.query(util.format("UPDATE users SET token='%s' WHERE username='%s'", token, req.body.username), function(err, rows, fields) {
	    if(err) throw err;
	    var tokenObj = {token:token};
	    res.json(tokenObj);
	});
    });
});

// Upload a new deck
app.post('/api/newdeck', function(req, res) {
    if(!req.body.hasOwnProperty('token') || !req.body.hasOwnProperty('deck') || !req.body.deck.hasOwnProperty('did') || !req.body.deck.hasOwnProperty('name') ||  !req.body.deck.hasOwnProperty('description') ||  !req.body.deck.hasOwnProperty('ispublic') ||  !req.body.deck.hasOwnProperty('cards'))
    {
	res.statusCode = 400;
	return res.send("Error: Wrong POST Syntax");
    }
    // Check if user has valid token  TODO: CHECK TIMESTAMP!!!!!!!!!
    pool.query(util.format("SELECT userid FROM users WHERE token='%s'", req.body.token), function(err, rows, fields) {
	if(err) throw err;
	if(rows.length != 1)
	{
	    res.statusCode = 403;
	    return res.send("Invalid token");
	}
	var userid = rows[0].userid;
	// TODO: CHECK IF DECK ALREADY EXISTS !!!!!!!!!!!! AND CHECK IF USER HAS VALID TOKEN!
	// Add to database, not public
	if(!req.body.deck.ispublic)
	{
	    if(!req.body.deck.hasOwnProperty('password'))
	    {
		res.statusCode = 400;
		return res.send("Error: If the deck is private, a password is required");
	    }	
	    var hash = crypto.createHash("sha1").update(req.body.deck.password).digest('hex');
	    pool.query(util.format("INSERT INTO decks (deckname, deckdescription, owner_uid, ispublic, dpassword) VALUES ('%s', '%s', '%s', %s, '%s')", req.body.deck.name, req.body.deck.description, userid, req.body.deck.ispublic, hash), function(err, rows, fields) {
		if(err) throw err;
		postdecksql();
	    });	
	}
	// Add to database, public
	else
	{
	    pool.query(util.format("INSERT INTO decks (deckname, deckdescription, owner_uid, ispublic) VALUES ('%s', '%s', '%s', %s)", req.body.deck.name, req.body.deck.description, userid, req.body.deck.ispublic), function(err, rows, fields) {
		if(err) throw err;
		postdecksql();
	    });
	}
	// Continue with other tables
	function postdecksql()
	{
	    // Get the id of the deck that was just created
	    pool.query(util.format("SELECT deckid FROM decks WHERE deckname='%s' AND deckdescription='%s' AND owner_uid='%s'", req.body.deck.name, req.body.deck.description, userid), function(err, rows, fields) 
		       { 
			   if(err) throw err;
			   if(rows.length != 1)
			   {
			       res.statusCode = 403;
			       return res.send("Error: Database Issue");
			   }
			   var deckid = rows[0].deckid;
			   // Insert into cards and cards_id tables
			   var cardreq = "INSERT INTO cards (deckid, front, back) VALUES ";
			   var getcardids = "SELECT cardid FROM cards WHERE "; 
			   for(var i = 0; i < req.body.deck.cards.length; i++)
			   {
			       cardreq += util.format("('%s','%s','%s'),", deckid, req.body.deck.cards[i].front, req.body.deck.cards[i].back);
			       getcardids += util.format("(deckid='%s' AND front='%s' AND back='%s') OR ", deckid, req.body.deck.cards[i].front, req.body.deck.cards[i].back);
			   }
			   // Remove extra characters
			   cardreq = cardreq.slice(0,-1);
			   getcardids = getcardids.slice(0,-4);
			   // Execute Command
			   pool.query(cardreq, function(err, rows, fields)
				      {
					  if(err) throw err;
					  // Execute Second Command
					  pool.query(getcardids, function(err, rows, fields)
						     {
							 if(err) throw err;
							 
							 var cardidreq = "INSERT INTO cards_id (userid, cardid, anki_cid) VALUES ";
							 for(var i=0; i<rows.length;i++)
							 {
							     cardidreq += util.format("('%s','%s','%s'),", userid, rows[i].cardid, req.body.deck.cards[i].cid);
							 }
							 var cardidreq = cardidreq.slice(0,-1);
							 // Run cards_id command
							 pool.query(cardidreq, function(err, rows, fields)
								    {
									pool.query(util.format("INSERT INTO decks_id (userid, deckid, anki_did, canedit) VALUES ('%s','%s','%s',true)", userid, deckid, req.body.deck.did), function(err, rows, fields) 
										   {
										       return res.json({status:"success"}); 
										   });
								    });
						     });
				      });
		       });
	    
	}
	
    });
});

// Get list of public decks
app.get('/api/publicdecks', function(req, res) {
    pool.query("SELECT decks.deckid, decks.deckname, decks.deckdescription, users.username FROM decks INNER JOIN users ON decks.owner_uid=users.userid WHERE decks.ispublic=true", function(err, rows, fields) {
	if(err) throw err;
	return res.json(rows);
    });
});

// Get list of users decks
app.post('/api/usersdecks', function (req, res) {
    if(!req.body.hasOwnProperty('token') || !req.body.hasOwnProperty('onlymine')) 
    {
	res.statusCode = 400;
	return res.send('Error: Wrong POST Syntax');
    }
    // Check token
    pool.query(util.format("SELECT userid FROM users WHERE token='%s'", req.body.token), function(err, rows, fields) {
	if(err) throw err;
	if(rows.length != 1)
	{
	    res.statusCode = 403;
	    return res.send("Invalid token");
	}
	var userid = rows[0].userid;
	if(req.body.onlymine)
	{
	    // Get list of ONLY user owned decks
	    
	}
    });
    
});



app.listen(3000);
console.log("Running on port 3000");
