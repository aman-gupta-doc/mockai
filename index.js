require("dotenv").config();

const express = require("express");
const app = express();
const chatRoutes = require("./openAI/chat");
const modRoutes = require("./openAI/mod");
const textRoutes = require("./openAI/text");
const imgRoutes = require("./openAI/image");
const { load: loadRandomContents } = require("./utils/randomContents");
const { load: loadFCContents } = require("./utils/functionCallContents");

const start = async () => {
	await loadRandomContents();
	loadFCContents();

	const port = process.env.SERVER_PORT || 5001;

	app.use(express.json());
	app.use((req, res, next) => {
		console.log(
			`${new Date().toISOString()} : request [${req.method}] ${req.url}`
		);
		next();
	});
	app.use(chatRoutes);
	app.use(modRoutes);
	app.use(textRoutes);
	app.use(imgRoutes);

	app.get("/", (req, res) => {
		res.send("Hello World! This is MockAI");
	});

	app.use(function (req, res) {
		res.status(404).send("Page not found");
	});

	app.listen(port, () => {
		console.log(`Server is running at http://localhost:${port}`);
	});
};

start();
