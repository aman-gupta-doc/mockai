const express = require("express");

const router = express.Router();

router.post("/v1/moderations", (req, res) => {
	const { input } = req.body;
	const model = "text-moderation-006";

	const response = {
		id: "modr-2nYZXNHxx1PeK1u8xXcE1Fqr1U6Ve",
		model: model,
		results: [
			{
				flagged: false,
				categories: {
					sexual: false,
					hate: false,
					harassment: false,
					"self-harm": false,
					"sexual/minors": false,
					"hate/threatening": false,
					"violence/graphic": false,
					"self-harm/intent": false,
					"self-harm/instructions": false,
					"harassment/threatening": false,
					violence: false,
				},
				category_scores: {
					sexual: 0.006622234359383583,
					hate: 0.00005902972043259069,
					harassment: 0.000058006080507766455,
					"self-harm": 0.00002550232420617249,
					"sexual/minors": 0.0002893423370551318,
					"hate/threatening": 0.00005756715836469084,
					"violence/graphic": 0.000013463495633914135,
					"self-harm/intent": 0.000016092611986096017,
					"self-harm/instructions": 0.000011878668374265544,
					"harassment/threatening": 7.277338681888068e-6,
					violence: 0.00038575733196921647,
				},
			},
		],
	};
	// Send the response
	res.json(response);
});

module.exports = router;
