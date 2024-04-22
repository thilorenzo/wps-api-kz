const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'upy4fkotg0uz4',
  password: '54@1#z@@mi%1',
  database: 'db5ez8w3r1mens'
});

// Catch de error de conexion
connection.connect((err) => {
  if (err) {
    console.error('Error de conexión:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});


connection.end();