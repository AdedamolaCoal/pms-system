import cluster from "cluster";
import { ExpressServer } from "./express_server";
import { DatabaseUtil } from "./modules/db";
// connect the express server
const server = new ExpressServer();
// connect the database
new DatabaseUtil();
process.on("uncaughtException", (error: Error) => {
	console.error(
		`Uncaught exception in worker process
${process.pid}:`,
		error
	);

	process.on("unhandledRejection", (error: Error) => {
		console.error(error);
	});
	// Close any open connections or resources
	server.closeServer();
	setTimeout(() => {
		cluster.fork();
		cluster.worker?.disconnect();
	}, 1000);
});
// Gracefully handle termination signals
process.on("SIGINT", () => {
	console.log("Received SIGINT signal");
	// Close any open connections or resources
	server.closeServer();
});
process.on("SIGTERM", () => {
	console.log("Received SIGTERM signal");
	// Close any open connections or resources
	server.closeServer();
});

/** For big project setup */
// import cluster from "cluster";

// import os from "os";
// const numCPUs = os.cpus().length;

// // server location
// import { ExpressServer } from "./express_server";

// // db location
// import { DatabaseUtil } from "./modules/db";

// new DatabaseUtil();

// if (cluster.isPrimary) {
// 	console.log(`Master process PID: ${process.pid}`);
// 	for (let i = 0; i < numCPUs; i++) {
// 		cluster.fork();
// 	}
// 	cluster.on("exit", (worker, code, signal) => {
// 		console.log(
// 			`Worker process ${worker.process.pid} exited with code ${code} and signal ${signal}`
// 		);
// 		setTimeout(() => {
// 			cluster.fork();
// 		}, 1000);
// 	});
// } else {
// 	// connect the express server
// 	const server = new ExpressServer();
// 	process.on("uncaughtException", (error: Error) => {
// 		console.error(
// 			`Uncaught exception in worker process ${process.pid}:`,
// 			error
// 		);
// 		// Close any open connections or resources
// 		server.closeServer();
// 		setTimeout(() => {
// 			cluster.fork();
// 			cluster.worker?.disconnect();
// 		}, 1000);
// 	});

// 	process.on("SIGINT", () => {
// 		console.log("Received SIGINT signal");
// 		server.closeServer();
// 	});

// 	process.on("SIGTERM", () => {
// 		console.log("Received SIGTERM signal");
// 		server.closeServer();
// 	});
// }
