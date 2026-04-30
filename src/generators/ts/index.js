'use strict';

const { genEntity }              = require('./genEntity');
const { genAggregateRoot }       = require('./genAggregateRoot');
const { genDomainEvent }         = require('./genDomainEvent');
const { genDomainError }         = require('./genDomainError');
const { genInboundPort }         = require('./genInboundPort');
const { genOutboundPort }        = require('./genOutboundPort');
const { genDTO }                 = require('./genDTO');
const { genUseCase }             = require('./genUseCase');
const { genController }          = require('./genController');
const { genRepository }          = require('./genRepository');
const { genWiring }              = require('./genWiring');
const { genSharedEntity }        = require('./genSharedEntity');
const { genSharedAggregateRoot } = require('./genSharedAggregateRoot');
const { genSharedEventBus }      = require('./genSharedEventBus');
const { genSharedErrorHandler }  = require('./genSharedErrorHandler');
const { genAppTs }               = require('./genAppTs');
const { genIndexTs }             = require('./genIndexTs');
const { genPackageJson }         = require('./genPackageJson');
const { genTsConfig }            = require('./genTsConfig');
const { genGitignore }           = require('./genGitignore');
const { genEnv }                 = require('./genEnv');
const { genReadme }              = require('./genReadme');

module.exports = {
  genEntity,
  genAggregateRoot,
  genDomainEvent,
  genDomainError,
  genInboundPort,
  genOutboundPort,
  genDTO,
  genUseCase,
  genController,
  genRepository,
  genWiring,
  genSharedEntity,
  genSharedAggregateRoot,
  genSharedEventBus,
  genSharedErrorHandler,
  genAppTs,
  genIndexTs,
  genPackageJson,
  genTsConfig,
  genGitignore,
  genEnv,
  genReadme,
};
