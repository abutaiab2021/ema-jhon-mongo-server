const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middle ware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xuva5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


console.log(uri);

async function run(){
    try{
        await client.connect();
        // console.log('Database Connected Successfully');
        const database = client.db('online_shop');
        const productCollection = database.collection('products');
        const orderCollection = database.collection('orders');

        //GET Products Api
        app.get('/products', async(req,res) =>{
            const cursor = productCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let products;
            const count = await cursor.count();
            if(page){
                products = await cursor.skip(page*size).limit(size).toArray();
            }
            else{
                products = await cursor.toArray();
            }
            res.send({
                count,
                products
            });
        });

        //use post to get data by keys
        app.post('/products/byKeys', async (req, res) => {
            
            const keys = req.body;
            console.log(keys);
            const query = { key: { $in: keys } }
            const products = await productCollection.find(query).toArray();
            res.json(products);
        });

        //Add Order Api
        app.get('/orders', async(req,res) =>{
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.json(orders);
        });
        app.post('/orders',async(req,res) =>{
            const order = req.body;
            order.createdAt = new Date;//for date and time storage
            // console.log('order',order);
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })
    }
    finally{
        // await client.close();
    }

}
run().catch(console.dir);


app.get('/',(req,res) =>{
    res.send('Ema Jhon Website')
});

app.listen(port, ()=>{
    console.log('Ema Jhon server Running on port',port);
});