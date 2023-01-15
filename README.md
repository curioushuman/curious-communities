# Curious Communities Monorepo

This will be the home for all things Curious Communities.

**Please note** this README is a garbled mess. Working towards a deadline, and still experimenting with infrastructure, then I will come back and tidy this up.

## Required .env file

```bash
NODE_ENV=local
CDK_LIVE_ACCOUNT={live cdk account id}
CDK_DEPLOY_ACCOUNT=000000000000
CDK_DEPLOY_REGION=ap-southeast-2
LOCALSTACK_API_KEY={localstack api key}
AWS_ACCOUNT_LOCAL=000000000000
AWS_ACCOUNT_TEST={test account id}
AWS_ACCOUNT_PROD={prod account id}
AWS_PROFILE_LOCAL=
AWS_PROFILE_TEST={test profile name}
AWS_PROFILE_PROD={prod profile name}

# Salesforce - see Salesforce API implementation for details on how to generate these
SALESFORCE_CONSUMER_KEY={consumer key}
SALESFORCE_CONSUMER_SECRET={consumer secret}
SALESFORCE_USER=api@asiapacificforum.net
SALESFORCE_URL_AUTH=https://login.salesforce.com
# This is only here as a backup, we obtain this from auth response
#SALESFORCE_URL_DATA=https://asiapacificforum.my.salesforce.com
SALESFORCE_URL_DATA_VERSION=56.0

# DYNAMICALLY UPDATED
AWS_ACCOUNT=000000000000
AWS_PROFILE=
NX_DEPLOY_TARGET=deploy-local
NX_DESTROY_TARGET=destroy-local
```

### Notes

* ./tools/scripts/set-stage.sh updates the dynamic values automatically
* all of this scripted in package.json

## Loaclstack

### Issues

#### ARN64 still not fully supported :(

As of 2022-12-27 it's in the post, but not quite there yet. The workaround I've discovered is:

1. Pull the localstack image separately, using platform linux/amd64
2. Run `pnpm deploy-local` normally, which will use the localstack image you just pulled

```bash

docker pull --platform linux/amd64 localstack/localstack-pro

```

Note: originally I was trying to pre-build the image (based on references below) but I couldn't figure out the specific location of the pro DockerFile so it wasn't working. Hence why we've moved to the pull method.

References:

* https://github.com/localstack/localstack/issues/4921
  * Limitations of arm64 for localstack
* https://docs.localstack.cloud/references/arm64-support/
  * Localstack docs on arm64 support and workarounds
* https://stackoverflow.com/questions/69054921/docker-on-mac-m1-gives-the-requested-images-platform-linux-amd64-does-not-m
  * Answer that helped with the 'build first' method
* https://github.com/docker/for-mac/issues/6356#issuecomment-1342520210
  * Other answer that led to this approach
* https://forums.docker.com/t/run-x86-intel-and-arm-based-images-on-apple-silicon-m1-macs/117123/6
  * Additional discussion, mostly around running amd64 images on arm64

## Get started

1. pnpm i
2. pnpm deploy-local
3. pnpm bootstrap-local

## Things that need to be outlined

- Using PNPM
  - Need to install
  - e.g. brew install pnpm
- OpenAPI file
  - In separate files
    - Inc. link
  - Drawn together during build
- CDK setup
  - https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html
    - Bootstrapping
      - cdk bootstrap aws://{AWS_ACCOUNT_ID}/ap-southeast-2
    - See if you can get some of this into a setup script
- Web packed vs packaged AKA Bundling process
  - Short term for shared libs we're web-packing them into service libs
  - Long term they should be broken out into their own packages
  - Talk to the other options we could try
    - e.g. bundle everything (inc. node_modules) into minified lambdas
    - Experiment and measure
- Handlers
  - Nx builds the layers
  - CDK will use esbuild to bundle and minify the handlers
    - Make sure esbuild is installed locally to speed up deployments / local testing
- libs/services
  - these are compiled by tsc only
  - they are not bundled with any of their dependent packages
- Options
  - We could webpack bundle some things into the package
    - e.g. the shared libs
  - OR we can keep everything separate
  - Simplicity, complexity, update management, version tracking, etc
- Layers vs local
  - Modules in the layers directory is distributed to our apps
    - This could be a combo of packaged (via NPM) or built (straight into the layer) modules
  - Modules in the local directory are employed by CDK to help in the Cloud Formation synth and deploy process
    - Again could be a combo of packaged or locally accessed modules
- Localstack
  - before you first run, you need to bootstrap
    - docker-compose up
    - node_modules/.bin/cdklocal --verbose bootstrap aws://000000000000/ap-southeast-2
      - Use the 000000000000 account id for localstack stuff
  - You also need a .env file in the root
    - CDK_DEPLOY_ACCOUNT=000000000000
    - CDK_DEPLOY_REGION=ap-southeast-2
  - to run
    - docker-compose up
    - node_modules/.bin/cdklocal --verbose bootstrap aws://000000000000/ap-southeast-2
      - Use the 000000000000 account id for localstack stuff
      - You need to bootstrap every time you docker up
    - nx run local
      - NOTE: I have not set this up for all projects just yet
    - nx run layers:local
      - For individual stacks
    - Free version of localstack doesn't support layers
      - You can use live layers
      - https://docs.localstack.cloud/aws/lambda/#lambda-layers
      - I've implemented this in the nx scripts within layers/project.json
    - Localstack run using a background process
      - Include some basic info about how this works, how to view/stop if necessary
      - https://bashitout.com/2013/05/18/Ampersands-on-the-command-line.html
    - When deploying local I use the --outputs-file for api-gateway based stacks
      - As adding --verbose to nx fails the layers deploy-local command
      - But we still need to know what the (new each time) API URLs are for our local testing env.
    - TO test the local APIs you need to look into this file to get the URL
      - Put it into Postman
      - Blah blah blah
      - Would be nice if we didn't have to do this
    - LOCALSTACK_API_KEY needs to be in .env
      - if we're using this
    - For some reason the first request to the public API always fails
      - OR it needs more time to settle
      - If you get an error that indicates nest/core cannot be found, give it a minute and try again
      - weirdly, it is intermittent
      - even when running it with live lambda layers it was hit and miss, rather than consistent
      - SUPER frustrating

## Big issues

- API Gateway Validation
  - Params / querystring validation
    - Currently it is not possible to do any kind of validation outside of required / not required
      - https://stackoverflow.com/questions/47849438/aws-api-gateway-query-parameter-validation
    - This moots it's value a little bit
    - Particularly when considering it from an asynchronous point of view
      - How do we inform the client of a bad request if it has been passed on through
    - **Option:** we'll always have access to their personal identification
        - Which is how we would have informed them of success/failure in other ways
    - **FOR NOW** we'll move forward with this level of validation
      - Coupled with type checking in the lambda
      - And asynchronous notification of success/error
      - While we wait for AWS to provide this function

## Decisions

- ids as external ids
  - The naming of the key identifier field will also reflect this
    - e.g. Member.externalId: MemberSourceId
  - The reason being that at any point down the line we could swan in and add an internal identifier without hassle
- libs/services
  - Will use a single module, and a single controller
    - As these are going to be imported by the handlers as a separate package
    - There is less need to break them into smaller files/functions for bundling
- source map
  - we're going for the environment variable method
- lambda response
  - Use APIGatewayProxyResult for everything

```javascript
const response: APIGatewayProxyResult = {
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json',
  },
  body: 'Hurrah',
};
```

## Rough optimization measurements

- 2.5ms Basic lambda
- 2.5ms Including layers (w?)
- 2.4ms Loading Nest modules (w?)
- 2.4ms Loading course modules (w?)
- 216.87ms initiating app (c!)
- 231.86ms with some basic logs (c!)
- 82.37 same as previous, but (w!)
- 285.23ms logging, without error (c!)
- 60.63 same as previous (w!)

### find-course

#### Using fake repository i.e. no DB

Some notes about this series of testing:

- Nest still in debug mode

- 1001.81 c!
- 580.56 w!

## TODO

- [ ] use OpenAPI for internal APIs as well (for now)
  - At some point something like the AWS CDK docs would be better
  - i.e. interfaces, methods, etc
  - But for now, let's keep it simple and consistent
  - And hope there is a docs generator we can use
- [ ] change your domain entities and value objects so they are no longer dependent on runtypes
  - Currently the format Entity.check() is riddled throughout the code
  - Which is very much a runtypes structure
  - We might be able to leave this format in place, but replace the direct reference to RunTypes with our own check() function
  - Still needs to throw an error, or return the RunType value

## Space for rough notes

### Multiple access points, to the same endpoint

Or something like that...

An example is GET/cc-courses

Admin will want /cc-courses/{externalId}
Public will want /cc-courses/{slug}
RESTapi should be /cc-courses/{id}

Then there is the service layer...

One way

- cc-api-admin
  - /cc-courses/{externalId}
  - handler
    - return FindCourseController.find({externalId})
  - controller
    - Findcc-coursesQuery({externalId})
    - return first
  - query/service
    - Repository.find({externalId})
  - repository
    - Varies
- api-public
  - /cc-courses/{id}
  - handler
    - return FindCourseController.find({id})
  - controller
    - return FindCourseQuery({id})
  - query/service
    - return Repository.findOne({externalId})
  - repository
    - Varies
- api-public
  - /cc-courses/{id?}?{slug?}
  - handler
    - return FindCourseController.find({id, slug})
  - controller
    - if ID
      - return FindCourseQuery({id})
    - else
      - Findcc-coursesQuery({externalId})
      - return first
  - query/service
    - Repository.findOne({externalId})
    - OR
    - Repository.find({externalId})
  - repository
    - Varies

The answers

- repository
  - find
  - findOne(byId)
- Queries/service
  - findOne
  - find
  - search
    - More serious version of find
- Controller
  - findOne(id or slug or external id)
    - if id
      - findOne
    - else
      - find
      - return first
  - find(dto)
    - find
  - search
    - search
- handler
  - supported by findOne
- api
  - can vary based on need

## Error handling and logging

**TODO:** success path summary

### Error

- For server (inc. unknown) errors
  - *Lambda*
  - Nest.logger.Error (lambda level) validation error
  - *API Gateway*
  - AWS.logger.?? 500 HTTP Exception
  - **OR**
  - *Nest*
  - Nest.logger.Warn {adapter.action} failed
  - Nest.logger.Error {error}
  - *Lambda*
  - AWS.logger.?? {function.action} failed
  - *API Gateway*
  - AWS.logger.?? 500 HTTP Exception
- For client errors
  - *Nest*
  - Nest.logger.Log {parser}
  - Nest.logger.Log {dataBeingParsed}
  - Nest.logger.Log {error}
  - *Lambda*
  - AWS.logger.?? {function.action} incomplete due to client error
  - *API Gateway*
  - AWS.logger.?? 400 HTTP Exception

**OPEN QUESTIONS**

- Should I catch errors at handler, do some Nest.logger logging, and then throw it again?
  - This'll depend on what AWS does
  - Let's run it in staging and review logs
  - If you need more, or different, logs then add this step

### AWS

#### API Gateway

**Summary (of error)**

- Errors handled at this layer
  - logger.Log 400 Bad Request
- Errors from lower layers
  - logger.Log {Error}

**NOTES**
- it is here we transform errors into a smaller subset (for public consumption)
  - 400
  - 404
  - 500

**TODO:** double check what level of log it is; error, warn, info, etc

**Summary (of success):**

- For all
  - 200 success

**TODO:** might need to double check if I need to turn this on

#### Lambda

**Summary (of error)**

- For server (inc. unknown) errors
  - Nest.logger.Error (lambda level) validation error
  - OR
  - AWS.logger.Warn {function.action} failed
    - e.g. cc-courses.findOne failed
- For client errors
  - logger.Log {function.action} incomplete due to client error
  - (All other, more detailed, info will have already been logged)

**NOTES**:

- FOR NOW I'm not even catching and wrapping errors at this level
  - Leaving it to Lambda/AWS for the time being
- We won't duplicate logging of the errors here
- We do not transform errors here, so other AWS services can react with as much info as possible

### Nest

**Summary (of error)**

- For server (inc. unknown) errors
  - logger.Warn {adapter.action} failed
    - e.g. error occurred saving/retrieving record
  - logger.Error {error}
- For client errors
  - logger.Log {parser}
  - logger.Log {dataBeingParsed}
  - logger.Log {error}

**Summary (of success):**

- For server (i.e. adapter) actions
  - logger.Log {action} succeeded
  - logger.Log {dataReturnedFromAction}
- For client requests
  - logger.Log {parser}
  - logger.Log {dataBeingParsed}

**Details:**

- All errors that occur are custom, BUT are ALL an extension of the Nest HttpException
  - Which extends TS.Error
  - This was a nice easy way to keep them uniform
  - And made it very simple for interaction with Rest/HTTP APIs
- ALL actions that should be wrapped in a try/catch ARE wrapped in performAction
  - Which includes logAction
    - Which will, on error
      - logger.warn({action} failed)
      - logger.error({error})
    - On success
      - logger.log({action} succeeded)
      - logger.log({dataReturnedFromAction})
  - This includes
    - Any interaction with concrete adapters e.g. DB, APIs, etc
  - Whenever one of these errors occur
    - It is passed all the way up, through the layers, to the controller
      - Through a combo of fs-tp.TaskEither (TE) awesome-ness
      - and TE.tryCatch (for internal promises)
    - Which will either
      - `return` the `promise`d response
      - Or `throw` the `error`
- ALL validation/parsing are wrapped in parseData
  - As our (chosen) validation library throws an error if invalid
  - Which includes logParse
    - Which will, on error
      - logger.log({parser})
      - logger.log({dataBeingParsed})
      - logger.log({error})
    - On success
      - logger.log({parser})
      - logger.log({dataBeingParsed})
  - This includes
    - Parsing of data at all levels
    - From infrastructure, to application
  - These validation errors are
    - Caught
    - Wrapped in our own custom errors
    - And will then fall within the same error flow outlined above
  - Whenever one of these errors occur i.e.
    - It is passed to the controller
    - Which will either `return` or `throw`

## Testing

* pnpm test
  * For all tests
* pnpm test-infra
  * For integration tests that involve AWS infrastructure
  * Only available for apps, but the --if-present is present in the call so all OK
  * **NOTE:** I think this is where I got up to, and got stalled i.e. WIP
* pnpm nx run cc-courses-service:test
  * For a particular service
* pnpm nx run cc-courses-service:test --watch
  * For watch mode
* * pnpm nx run cc-api-admin:test-infra
  * Similar to previous but for integration tests involving infrastructure
