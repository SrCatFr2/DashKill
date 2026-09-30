const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

const publicPath = path.join(__dirname, "public");

app.use(
    express.static(publicPath, {
        extensions: ["html"]
    })
);

/*
    Página principal
*/

app.get("/", (req, res) => {
    res.sendFile(
        path.join(publicPath, "index.html")
    );
});

/*
    En desarrollo, si pedimos un archivo
    que no existe, devolvemos 404 en lugar
    de enviar index.html como si fuera JS.
*/

app.use((req, res) => {
    res.status(404).send("Not found");
});

app.listen(PORT, () => {
    console.log(
        `DashKill running at http://localhost:${PORT}`
    );
});
