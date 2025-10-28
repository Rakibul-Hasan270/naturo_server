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
        const orderCollection = client.db("naturo_db").collection('orders');

        // items related apis 
        app.get('/items', async (req, res) => {
            try {
                const search = req.query.search || "";
                let query = {};
                if (search.trim() !== "") {
                    query = {
                        name: { $regex: search, $options: "i" }
                    };
                }
                const result = await itemCollection.find(query).toArray();
                res.send(result);
            } catch (error) {
                console.error("Error fetching items:", error);
                res.status(500).send({ message: "Internal Server Error" });
            }
        });

        app.get('/items/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await itemCollection.findOne(query);
            if (!result) {
                return res.status(404).send({ message: "Item not found" });
            }
            res.send(result);
        })

        app.delete('/items/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await itemCollection.deleteOne(query);
            res.send(result);
        })

        app.patch('/items/:id', async (req, res) => {
            const id = req.params.id;
            const product = req.body;
            const query = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    name: product.name,
                    category: product.category,
                    image: product.image,
                    presentPrice: product.presentPrice
                }
            }
            const result = await itemCollection.updateOne(query, updatedDoc);
            res.send(result);
        })

        app.post('/items', async (req, res) => {
            const product = req.body;
            const result = await itemCollection.insertOne(product);
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

        // order related apis 
        app.post('/order', async (req, res) => {
            const orderInfo = req.body;
            const result = await orderCollection.insertOne(orderInfo);
            res.send(result);
        })

        app.get('/order', async (req, res) => {
            const result = await orderCollection.find().toArray();
            res.send(result);
        })

        app.patch('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    status: 'confirm'
                }
            }
            const result = await orderCollection.updateOne(query, updatedDoc);
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