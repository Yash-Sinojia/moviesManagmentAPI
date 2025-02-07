const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors')

const app = express();

const PORT = process.env.PORT || 5500;
const MONGO_URI = process.env.MONGO_URI;

app.use(express.json());
app.use(cors())
mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() =>{
        console.log('Connected to MongoDB')
    })
    .catch((err) =>{
        console.log('error : ', err)
    });

const movieSchema = new mongoose.Schema({
    movieCode : { type: String, required: true},
    title : { type: String, required: true},
    director : { type: String, required: true},
    releaseYear : { type: String, required: true},
    genre : { type: String, required: true}
})

const Movie = mongoose.model('Movie', movieSchema);

//adding movie data

app.post('/movies', async(req,res) =>{
    try {
        const {movieCode, title, director, releaseYear, genre} = req.body;
        const movie = new Movie({movieCode, title, director, releaseYear, genre});
        await movie.save();
        res.status(201).json(movie); 

    } catch (error) {
        res.status(400).send(error.message);
    }
})

// Retrieve a list of all movies.
app.get('/movies', async(req,res) =>{
    try {
        const movies = await Movie.find();
        res.json(movies);
    } catch (error) {
        res.status(400).send(error.message);
    }
})

//Retrieve details of a single movie using the unique 
app.get('/movies/:movieCode', async(req,res) =>{
    try {
        const {movieCode} = req.params;
        const movie = await Movie.findOne({ movieCode});
        if(!movie) return res.status(500).send('Movie not found');
        res.json(movie);
    } catch (error) {
        res.status(500).send(error.message);
    }
})

//Delete a movie by movieCode.
app.delete("/movies/:movieCode",async(req,res) =>{
    try {
        const { movieCode } = req.params;
        const deleteMovie = await Movie.findOneAndDelete({ movieCode: movieCode});
        if( !deleteMovie ) return res.status(404).send("movie does not exist in the list");
        res.send(`Movie with code ${movieCode} has been deleted successfully`);
    } catch (error) {
        res.status(500).send(error.message);
    }
})

//update a movie by movieCode.
app.put("/movies/:movieCode", async (req,res) =>{
    try {
        const { movieCode } = req.params;
        const updatedData = req.body;
        
        const updateMovie = await Movie.findOneAndUpdate(
            {movieCode: movieCode},
            updatedData,
            {new: true, runValidators: true}
        );

        if(!updateMovie) return res.status(404).send("movie not found");
        res.json(updateMovie);

    } catch (error) {
        res.status(400).send(error.message);
    }
})

app.listen(PORT, () =>{
    console.log(`server running @ ${PORT}`)
});