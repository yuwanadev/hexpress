'use strict';

function genAppTs(type) {
  return `import express, { Application, Router } from "express";
import { errorHandler } from "./shared/infrastructure/http/errorHandler";
import { responseHandler } from "./shared/infrastructure/http/responseHandler";
import config from "./config/index";
import cors from "cors";
import helmet from "helmet";
// import { compose${type === 'modular-monolith' ? 'ExampleModule' : 'Example'} } from '${type === 'modular-monolith' ? './modules/example/example.module' : './wiring'}';

export class App {
  private readonly app: Application;
  private readonly router: Router;

  constructor() {
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
    this.registerModules();
    this.app.use(errorHandler);
  }

  private registerModules(): void {
    // compose${type === 'modular-monolith' ? 'ExampleModule' : 'Example'}({ pool, router });
  }

  public listen() {
    return this.app.listen(config.port, () => {
      console.log(\`[Server] Listening on port \${config.port} (\${config.env})\`);
      if (config.env === "development") {
        console.log(JSON.stringify(config));
      }
    });
  }

  public getApp(): Application {
    return this.app;
  }
}`;
}

module.exports = { genAppTs };
