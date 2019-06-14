require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const MOVIEDEX = require('./moviedex.json');

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(helmet());

app.use(function validateBearerToken(req, res, next) {
    const authToken = req.get('Authorization');
    const apiToken = process.env.API_TOKEN;
    
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({ error: 'Unauthorized request' });
    }
    next();
})

function handleGetMovies(req, res) {
    let response = MOVIEDEX;

    if (req.query.genre) {
        response = response.filter(movie =>
            movie.genre.toLowerCase().includes(req.query.genre.toLowerCase())
        );
    }
    if (req.query.country) {
        response = response.filter(movie =>
            movie.country.toLowerCase().includes(req.query.country.toLowerCase())
        );
    }
    if (req.query.avg_vote) {
        let voteQuery = parseFloat(req.query.avg_vote, 10);
        if (Number.isNaN(voteQuery)) {
            return res.status(400).send('Average vote must be a number.')
        }
        else {
            response = response.filter(movie =>
                movie.avg_vote >= voteQuery);
        }
    }

    res.json(response);
}

app.get('/movies', handleGetMovies);

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
})