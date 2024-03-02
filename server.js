const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });
console.log(process.env);
// console.log(process.env.NODE_ENV);
// console.log(process.env.PORT);
// console.log(process.env.USERNAME);
// console.log(process.env.PASWORD);


const port = process.env.PORT; 
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
})