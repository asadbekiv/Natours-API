'use strict'

const express = require('express');
const fs = require('fs');

const app = express();


app.use(express.json())   // Middlware 
// app.get('/',(req,res)=>{
    //     res.status(200).json({message:'Hello from the server !',app:'natours'})


// });

// app.post('/',(req,res)=>{
//     res.send('You can post to this endpoint 🔚')
// })

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`))
// console.log(tours);

app.get('/api/v1/tours/:id',(req,res)=>{
    console.log(req.params);

    const id=req.params.id*1;
    const tour = tours.find(el=>el.id === id);

    if(id > tours.length){
        return res.status(404).json({
            status:"fail",
            message:"Invalid ID number !"

        })
    }


    res.status(200).json({
        status:'success',
        result: tours.length,
        data:{
            tour
        }
    })

})

app.post('/api/v1/tours',(req,res)=>{

    const newId = tours[tours.length-1].id+1;
    const newTour = Object.assign({id:newId},req.body);
    tours.push(newTour);

    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,JSON.stringify(tours),err=>{
        res.status(201).json({
            status:"success",
            data:{
                tour:newTour
            }
        });

    });
    // res.send('done')     
});

app.patch('/api/v1/tours/:id',(req,res)=>{

    if(req.params.id*1 > tours.length){
        return res.status(404).json({
            status:"fail",
            message:"Invalid ID number !"

        });
    }

    res.status(200).json({
        status:"success",
        data:{
            tour:"<Update tour here...>"
        }
    });
});
app.delete('/api/v1/tours/:id',(req,res)=>{

    if(req.params.id*1 > tours.length){
        return res.status(404).json({
            status:"fail",
            message:"Invalid ID number !"

        });
    }

    res.status(204).json({
        status:"success",
        data:{
            tour: null
        }
    });
});


const port = 5000;
app.listen(port,()=>{
    console.log(`App is running on port ${port}`);
})
 