const express = require("express");
const app = express();
const port = 8080;
const { networkInterfaces } = require('os');
const nets = networkInterfaces();
const results = Object.create(null); // Or just '{}', an empty object


app.listen(process.env.PORT || port, () => {
    console.log(`Listening at http://localhost:${port}`)
	
	for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
            const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
            if (net.family === familyV4Value && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }
    console.log(results);
	console.log(`${port}`);
	console.log(`${process.env.PORT}`);
});

app.use(express.urlencoded());
app.use(express.json());

app.post('/api/signup', async (req, res) => {
  console.log("signup new user " + req.body.email);

  res.send('good now');  
});

