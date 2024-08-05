'use strict';

//   function main(x,y){

//     // (1,2),(-1,3),(0,4),(1,1),(1,1)
//     if(x>y){
//         console.log(`The least one is ${y}`);
//     }else if(x<y){
//         console.log(`The least one is ${x}`);

//     }else if(x=y){
//         return x;
//     }else{
//         return 'some problem in tour code !'
//     }
//   }

//   let reults=main(-1,-1);
//   console.log(reults);

// function min(a, b) {
//     if (a < b) {
//       return a;
//     } else {
//       return b;
//     }
//   }

// let result=min(1,2);
// console.log(result);
// console.log("good");

// let arr=[0,10,20,30];
// const filter =function(arr,fn){
//   for (let n = 0; n < array.length; n++) {
//     const element = arr[n];

//   }
//   return element;
// }

// console.log(filter);
// const dotenv = require('dotenv');
// dotenv.config({ path: './config.env' });

// const app = require('./app');

// console.log(process.env.NODE_ENV);

//  newly created user token name is Clinte Jef yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2Mzg1ZjdiNjQyNDhjZDU4YTE5YzU1ZCIsImlhdCI6MTcxNDk3MDQ5MSwiZXhwIjoxNzE3NTYyNDkxfQ.kMFndSsZeBCeSmyKz9ESNE08aNceCvPNXmiBq95Luss
// Promise.all([
//   Promise.resolve('image1-processed'),
//   Promise.resolve('image2-processed'),
//   Promise.resolve('image3-processed'),
// ])
//   .then((results) => {
//     console.log(results); // Output: ['image1-processed', 'image2-processed', 'image3-processed']
//   })
//   .catch((error) => {
//     console.error(error); // This will not run since all promises resolved successfully
//   });

// const fs = require('fs');

// // console.log(__dirname, __filename);
// const data = JSON.parse(fs.readFileSync(`${__dirname}/sample.json`, 'utf-8'));
// const result = [];

// for (const region in data) {
//   const cities = data[region].filter((entry) => entry.city);
//   result.push(...cities);
// }

// console.log(result);
