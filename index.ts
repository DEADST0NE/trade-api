import app from './src/app'
require('dotenv').config()

const PORT = process.env.PORT || 3000

const start = async() => { 
  console.log("Server ready at: http://localhost:", PORT, "\n");
  app.listen(PORT); 
}

start();