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

var { auth, requiredScopes } = require('express-oauth2-jwt-bearer');

// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
// process.env.TOKEN_SIGNING_ALG = 'HS256';
const checkJwt = auth({
    audience: 'https://dev-264uwjwu6c8xz02x.us.auth0.com/api/v2/',
    issuerBaseURL: `https://dev-264uwjwu6c8xz02x.us.auth0.com/`
});

// This route doesn't need authentication
app.get('/api/public', function(req, res) {
    res.json({
      message: 'Hello from a public endpoint! You don\'t need to be authenticated to see this.'
    });
  });
  
  // This route needs authentication
  app.post('/api/private', checkJwt, function(req, res) {
    console.log(req.auth.token)
    res.json({
      message: 'Hello from a private endpoint! You need to be authenticated to see this.',
      authHeader: req.auth.token
    });
  });

process.env.BASE_URL = 'http://localhost:3000';
process.env.client_id = 'LdAY83PSgHaVKDm5Tyn2vq9e5QqlH7lC';
process.env.issuer_Base_URL = 'https://dev-264uwjwu6c8xz02x.us.auth0.com';
process.env.SECRET = 'secret.txt';
let client_secret = 'REKd60vb8gC-iNZ2V0cXImVYlQ7TV4VKG4wLKCJWnklf7jvpROXgsDrOKZNbHGUy';
console.log(process.env.SECRET);
var { auth, requiresAuth, apiAuth } = require('express-openid-connect');

/*app.use(
  auth({
    authRequired: false,
  })
);*/
const config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: process.env.BASE_URL,
  clientID: process.env.client_id,
  issuerBaseURL: process.env.issuer_Base_URL,
  secret: client_secret
};

// The `auth` router attaches /login, /logout
// and /callback routes to the baseURL
app.use(auth(config));

//app.use(auth());
app.get('/', requiresAuth(), async (req, res) => { // this is how auth0 does user authentication, it will redirect user to login page if user is not authenticated
    console.log(process.env.SECRET)
    res.send(`hello ${req.oidc.user.sub} ${req.oidc.user.name} ${req.oidc.isAuthenticated()} <a href='http://localhost:3000/v2/logout?federated'>logout</a>`);
});

const {
  ManagementClient
} = require('auth0');
const auth0Management = new ManagementClient({
  domain: 'dev-264uwjwu6c8xz02x.us.auth0.com',
  clientId: 'etXifPdd3SCf0FvukYbTEvY5SekYwoNu',
  clientSecret: '5XEBRUYJrM-s-y2Rnx3KyB4T-ZvVyTboemoHCEmNGRlJgeiKENRa6Mhx2ewOrAiT',
  scope: 'create:users delete:users read:users read:user_idp_tokens read:roles update:users',
  audience: 'https://dev-264uwjwu6c8xz02x.us.auth0.com/api/v2/',
  grant_type: 'client_credentials',
  tokenProvider: {
   enableCache: true,
   cacheTTLInSeconds: 10
 }
});

app.get('/api/signup', async (req, res) => {
  console.log("signup new user " + req.body.email);

  const user = {
    email: req.body.email,
    user_metadata: {},
    blocked: false,
    email_verified: false,
    app_metadata: {},
    given_name: req.body.firstName,
    family_name: req.body.lastName,
    name: req.body.firstName + ' ' + req.body.lastName,
    user_id: req.body.userId,
    connection: 'Username-Password-Authentication',
    password: req.body.password,
    verify_email: false,
    username: req.body.firstName + '.' + req.body.lastName + Math.floor(Math.random() * 100)
  };
  await auth0Management.createUser(user);

  res.send({
    message: "You're registered ",
    id: req.body.userId,
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName
  });
});

app.get('/user', requiresAuth(), async (req, res) => {
    
    const userInfo = await req.oidc.fetchUserInfo();
    res.send(userInfo.email);
});

app.get('/admin', (req, res) => {
    console.log("admin page - no auth");
    res.send('admin page - no auth');
})

var axios = require("axios").default;
app.post('/api/login', async(req, res) => {
  var options = {
    method: 'POST',
    url: 'https://dev-264uwjwu6c8xz02x.us.auth0.com/passwordless/start',
    headers: {'content-type': 'application/json'},
    data: {
      client_id: 'bSPhMzpoeHixOqvV0nwZ5BCs36nqKGdk',
      client_secret:"avUB7bhIETRsK-wD3JCdFISTaetZvEksV6m-S0q_lCqd99zINb37BbSKspjp_Wik",
      connection: 'email',
      email: req.body.email,
      send: 'code'
    }
  }
  
  var responseData = "something went wrong - no data set";
  await axios.request(options).then(function (response) {
    responseData = response.data;
    console.log(response.headers);
  }).catch(function (error) {
    console.error(error);
    res.send("something went wrong");
  });

  res.send(responseData);

});

app.post('/api/logout', async(req, res) => {
  console.log("logging out " + req.body);
  var options = {
    method: 'POST',
    url: 'https://dev-264uwjwu6c8xz02x.us.auth0.com/logout',
    headers: {'content-type': 'application/json'},
    data: {
      client_id: 'bSPhMzpoeHixOqvV0nwZ5BCs36nqKGdk',
      client_secret:"avUB7bhIETRsK-wD3JCdFISTaetZvEksV6m-S0q_lCqd99zINb37BbSKspjp_Wik",
      connection: 'email',
      email: req.body.email,
      send: 'code'
    }
  }
  
  var responseData = "something went wrong - no data set";
  await axios.request(options).then(function (response) {
    responseData = "done!!!";
    console.log(response.headers);
  }).catch(function (error) {
    console.error(error);
    res.send("something went wrong");
  });

  res.send({message : responseData});
});
/*
var options = {
  method: 'POST',
  url: 'https://dev-264uwjwu6c8xz02x.us.auth0.com/passwordless/start',
  headers: {'content-type': 'application/json'},
  data: {
    client_id: 'bSPhMzpoeHixOqvV0nwZ5BCs36nqKGdk',
    client_secret:"avUB7bhIETRsK-wD3JCdFISTaetZvEksV6m-S0q_lCqd99zINb37BbSKspjp_Wik",
    connection: 'email',
    email: 'a@a.com',
    send: 'code'
  }
};
axios.request(options).then(function (response) {
  console.log(response.data);
}).catch(function (error) {
  console.error(error);
});*/