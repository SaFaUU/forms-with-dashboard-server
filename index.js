const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const fileUpload = require('express-fileupload')
const mongodb = require('mongodb')
const fs = require('fs')
const binary = mongodb.Binary

const mongoClient = mongodb.MongoClient
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json());
app.use(fileUpload())
require("dotenv").config();


const uri = `mongodb+srv://${process.env.FORMS_USER}:${process.env.FORMS_PASSWORD}@cluster0.1cmhy5v.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function insertFile(file, res) {
    mongoClient.connect(uri, { useNewUrlParser: true }, (err, client) => {
        if (err) {
            return err
        }
        else {
            let db = client.db('forms')
            let collection = db.collection('formsData')
            try {
                collection.insertOne(file)
                console.log('File Inserted')
            }
            catch (err) {
                console.log('Error while inserting:', err)
            }
            res.redirect('/')
        }

    })
}


async function run() {
    try {
        const formsDataCollection = client.db("forms").collection('formsData');

        app.post('/save-form-data', async (req, res) => {
            const data = req.body;
            // console.log(req.files)
            let file = {
                name: data.name,
                rollNumber: data.rollNumber,
                branch: data.branch,
                file: binary(req.files.document.data)
            }
            // console.log(data)
            insertFile(file, res)
            res.send({ message: 'Success' })
        })
        app.get('/form-data', async (req, res) => {
            const cursor = formsDataCollection.find({})
            const formData = await cursor.toArray()
            res.send(formData)
        })
    }
    catch {

    }
}
run().catch(err => console.error(err));


app.get('/', (req, res) => {
    res.send('Forms Server is running');
})
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});