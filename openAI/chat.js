const express = require("express");
const { getRandomContents } = require("../utils/randomContents");
const { getFCContents } = require("../utils/functionCallContents");
const { tokenize } = require("../utils/tokenize");

const router = express.Router();

const get_random = (list) => {
	return list[Math.floor(Math.random() * list.length)];
};

router.post("/v1/chat/completions", (req, res) => {
	const defaultMockType = process.env.MOCK_TYPE || "random";
	const {
		messages,
		stream,
		mockType = defaultMockType,
		mockFixedContents,
		model,
		functions = [],
		function_call,
	} = req.body;
	function_name = "";
	if (functions.length > 0) {
		if (function_call === "auto") {
			function_name = get_random(functions.map((x) => x.name));
		} else {
			function_name = function_call.name;
		}
	}
	console.log(
		`Stream : ${stream}, mockFixedContents : ${mockFixedContents}, model : ${model}, function_name : ${function_name}`
	);
	const randomResponses = getRandomContents();
	const fCContents = getFCContents();

	// Check if 'messages' is provided and is an array
	if (!messages || !Array.isArray(messages)) {
		return res
			.status(400)
			.json({ error: 'Missing or invalid "messages" in request body' });
	}

	// Check if 'stream' is a boolean
	if (stream !== undefined && typeof stream !== "boolean") {
		return res
			.status(400)
			.json({ error: 'Invalid "stream" in request body' });
	}

	// Get response content
	let content;
	switch (mockType) {
		case "echo":
			content = messages[messages.length - 1].content;
			break;
		case "random":
			content =
				randomResponses[
					Math.floor(Math.random() * randomResponses.length)
				];
			break;
		case "fixed":
			content = mockFixedContents;
			break;
		case "function_call":
			content =
				fCContents[function_name] ??
				fCContents[function_name === "" ? "default" : "default_fc"];
	}

	// Generate a mock response
	// If 'stream' is true, set up a Server-Sent Events stream
	if (stream) {
		// Set the headers for SSE
		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");
		const role_name = "assistant";

		const data = {
			id: "chatcmpl-7UR4UcvmeD79Xva3UxkKkL2es6b5W",
			object: "chat.completion.chunk",
			created: Date.now(),
			model: model,
			choices: [
				{
					index: 0,
					delta: {},
					finish_reason: null,
				},
			],
		};

		const intervalTime = process.env.INTERVAL || 100;
		let chunkIndex = 0;
		let tokens = tokenize(content); // Tokenize the content
		let intervalId = setInterval(() => {
			if (chunkIndex < tokens.length) {
				if (chunkIndex === 0) {
					const delta_f = {};
					delta_f.role = role_name;
					delta_f.content = "";
					if (function_name !== "") {
						delta_f.content = null;
						delta_f.function_call = {
							name: function_name,
							arguments: "",
						};
					}
					data.choices[0].delta = delta_f;
					res.write(`data: ${JSON.stringify(data)}\n\n`);
				}
				const delta = {};

				if (function_name !== "") {
					delta.function_call = {
						arguments: tokens[chunkIndex],
					};
				} else {
					delta.content = tokens[chunkIndex];
				}
				data.choices[0].delta = delta;
				res.write(`data: ${JSON.stringify(data)}\n\n`);
				chunkIndex++;
			} else {
				clearInterval(intervalId);
				data.choices[0] = {
					delta: {},
					finish_reason: "stop",
				};
				res.write(`data: ${JSON.stringify(data)}\n\n`);
				res.write(`data: [DONE]\n\n`);
				res.end();
			}
		}, intervalTime);
	} else {
		const n = req.body.n || 1; // Get 'n' from request body, default to 1 if not provided
		const choices = [];

		for (let i = 0; i < n; i++) {
			if (function_name !== "") {
				choices.push({
					message: {
						role: "assistant",
						content: null,
						function_call: {
							name: function_name,
							arguments: content,
						},
					},
					finish_reason: "stop",
					index: i,
				});
			} else {
				choices.push({
					message: {
						role: "assistant",
						content: content,
					},
					finish_reason: "stop",
					index: i,
				});
			}
		}

		const response = {
			id: "chatcmpl-2nYZXNHxx1PeK1u8xXcE1Fqr1U6Ve",
			object: "chat.completion",
			created: Math.floor(Date.now() / 1000),
			model: model,
			usage: {
				prompt_tokens: 10,
				completion_tokens: 50,
				total_tokens: 60,
			},
			choices: choices,
		};
		// Send the response
		res.json(response);
	}
});

module.exports = router;
