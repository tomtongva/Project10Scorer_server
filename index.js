const express = require("express");
const app = express();
const port = 3000;
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

process.env.BASE_URL = 'http://localhost:3000';
process.env.client_id = 'LdAY83PSgHaVKDm5Tyn2vq9e5QqlH7lC';
process.env.issuer_Base_URL = 'https://dev-264uwjwu6c8xz02x.us.auth0.com';
process.env.SECRET = 'secret.txt';
console.log(process.env.SECRET);
const { auth, requiresAuth, apiAuth } = require('express-openid-connect');

app.use(
  auth({
    authRequired: false,
  })
);

//app.use(auth());
app.get('/', requiresAuth(), async (req, res) => {
    console.log(process.env.SECRET)
    res.send(`hello ${req.oidc.user.sub} ${req.oidc.user.name} ${req.oidc.isAuthenticated()} <a href='http://localhost:3000/logout?federated'>logout</a>`);
});

app.get('/signup', (req, res) => {
    console.log("admin page - no auth");
    res.send('admin page - no auth');
});

app.get('/user', requiresAuth(), async (req, res) => {
    
    const userInfo = await req.oidc.fetchUserInfo();
    res.send(userInfo.email);
});

app.get('/admin', (req, res) => {
    console.log("admin page - no auth");
    res.send('admin page - no auth');
})