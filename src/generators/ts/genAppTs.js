'use strict';

function genAppTs(type) {
  return `import express, { Application, Router } from "express";
import { errorHandler } from "./shared/infrastructure/http/errorHandler";
import { responseHandler } from "./shared/infrastructure/http/responseHandler";
import { registerModules } from "./shared/infrastructure/di/ctn";
import cors from "cors";
import helmet from "helmet";

export class App {
  private readonly app: Application;
  private readonly router: Router;
  private readonly config: any;

  constructor(config: any) {
    this.config = config;
    this.app = express();
    this.router = express.Router();
    this.configure();
  }

  private configure(): void {
    /**
     * Global middlewares
     */
    this.app.use(
      cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin"],
      }),
    );
    this.app.use(helmet({ crossOriginResourcePolicy: false }));

    /**
     * Body parser
     */
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    /**
     * Response helpers (res.ApiResponse, res.ApiResponseWithMessage)
     */
    this.app.use(responseHandler);

    this.app.use("/api", this.router);
    registerModules(this.router);
    this.app.use(errorHandler);
  }

  public listen() {
    return this.app.listen(this.config.port, () => {
      console.log(\`[Server] \${this.config.app.name} v\${this.config.app.version} listening on port \${this.config.port} (\${this.config.env})\`);
      if (this.config.env === "development") {
        console.log(JSON.stringify(this.config));
      }
    });
  }

  public getApp(): Application {
    return this.app;
  }
}`;
}

module.exports = { genAppTs };
