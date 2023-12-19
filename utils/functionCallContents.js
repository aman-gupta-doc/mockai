const fs = require("fs");
const path = require("path");
const readline = require("readline");

let randomResponses = {};
default_resp = "this is default response string.";
default_fc_resp = "this is default function call string";

const load = () => {
	const rootDir = path.resolve(__dirname, "../");
	const filePath = process.env.MOCK_FC_FILE_PATH || "";

	if (filePath === "") {
		randomResponses["default"] = default_resp;
		randomResponses["default_fc"] = default_fc_resp;
		resolve();
	} else {
		const fpath = path.join(rootDir, filePath);

		file_json = JSON.parse(fs.readFileSync(fpath, "utf8"));
		randomResponses = {
			default: default_resp,
			default_fc: default_fc_resp,
			...file_json,
		};
	}
};

const getFCContents = () => randomResponses;

module.exports = {
	load,
	getFCContents: getFCContents,
};
