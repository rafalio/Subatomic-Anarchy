var lr = require('./loginregisterh.js');

app.get('/', lr.index);

app.get('/login', lr.login_register_f);

app.post('/login', lr.login);

app.post('/register', lr.register);