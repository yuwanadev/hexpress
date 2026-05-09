'use strict';

function genAppJs(type) {
  return `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './shared/infrastructure/http/errorHandler.js';
import { responseHandler } from './shared/infrastructure/http/responseHandler.js';
import { registerModules } from './shared/infrastructure/di/ctn.js';

export class App {
  /**
   * @param {import('./config/index.js').AppConfig} config
   */
  constructor(config) {
    this.config = config;
    this.app = express();
    this.router = express.Router();
    this.configure();
  }

  configure() {
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

    this.app.use('/api', this.router);
    registerModules(this.router);
    this.app.use(errorHandler);
  }

  listen() {
    return this.app.listen(this.config.port, () => {
      console.log(\`[Server] \${this.config.app.name} v\${this.config.app.version} listening on port \${this.config.port} (\${this.config.env})\`);
      if (this.config.env === "development") {
        console.log(JSON.stringify(this.config));
      }
    });
  }

  getApp() {
    return this.app;
  }
}
`;
}

module.exports = { genAppJs };
