const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 9000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7ks5x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

            const itemCollection = client.db("naturo_db").collection('items');

        app.get('/items', async (req, res) => {
            const result = await itemCollection.find().toArray();
            res.send(result);
        })

        app.get('/items/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await itemCollection.findOne(query);
            if (!result) {
                return res.status(404).send({ message: "Item not found" });
            }
            res.send(result);
        })

        app.get('/categorys/:category', async (req, res) => {
            const category = req.params.category;
            const query = { category: category };
            const result = await itemCollection.find(query).toArray();
            if (!result) {
                return res.status(404).send({ message: "Item not found" });
            }
            res.send(result);
        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally { }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('natero is open');
})

app.listen(port, () => {
    console.log(`Natero runing on port ${port}`);
})