import express, { Application } from "express";
import { IServerConfig } from "./modules/config";
import * as config from "../server_config.json";
import morgan from "morgan";
import { Routes } from "routes";
import bodyParser from "body-parser";

export class ExpressServer {
	private static server = null;
	public server_config: IServerConfig = config;

	constructor() {
		const port = this.server_config.port ?? 3000;

		const app = express();

		app.use(morgan("tiny"));
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({ extended: true }));

		app.get("/ping", (req, res) => {
			res.send("ping!");
		});

		const routes = new Routes(app);
		if (routes) {
			console.log("Server Routes are started.");
		}

		ExpressServer.server = app.listen(port, () => {
			console.log(
				`Server is running on port ${port} with pid = ${process.pid}`
			);
		});
	}

	// closes the express server for safe on uncaught exceptions
	public closeServer() {
		ExpressServer.server.close(() => {
			console.log("Server closed.");
			process.exit(0);
		});
	}
}
