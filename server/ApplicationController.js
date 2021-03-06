import uuid from 'node-uuid';
import logger from './logger';
import fs from 'fs';
import path from 'path';

bootstrapDbFile();
const applications = JSON.parse(fs.readFileSync(path.resolve('./db.json')));

/**
 * Creates a controller for handling application forms.
 *
 * @class ApplicationController
 * @classdesc A controller for handling applications to the Cornish Incubator program.
 */
export default class ApplicationController {
  /**
   * Creates an application.
   *
   * @example
   *     POST /application/
   *     body:
   *     {
   *       "pointOfContact": { "name": "Doug Wade", "email": "doug@dougwade.io" },
   *       "contributors": [{ "name": "Bob Synder", "email": "bob@bobsnyderdesign.com" }],
   *       "category": "tech",
   *       "idea": "paragraph of text",
   *       "audience": "paragraph of text",
   *       "finances": "paragraph of text",
   *       "goal": "paragraph of text",
   *       "mission": "paragraph of text",
   *       "whyThisWhyNow": "paragraph of text"
   *     }
   */
  _upsert(){
    return function*() {
      const application = this.request.body;

      if (application.id) {
        for (var i = 0; i < applications.length; i++) {
          if (applications[i].id.toString() === application.id) {
            applications[i] = application;
            logger.info(`Updated application ${JSON.stringify(application)}`);
          }
        }
      } else {
        application.id = uuid.v4();
        logger.info(`Created application ${JSON.stringify(application)}`);
        applications.push(application);
      }

      write(applications);

      this.body = application;
    };
  }


	/**
   * Creates an application.
   *
   * @example
   *     GET /application/956460fe-9635-4618-b1cb-a407d1445d6f
   *     returns:
   *     {
   *       "pointOfContact": { "name": "Doug Wade", "email": "doug@dougwade.io" },
   *       "contributors": [{ "name": "Bob Synder", "email": "bob@bobsnyderdesign.com" }],
   *       "category": "tech",
   *       "idea": "paragraph of text",
   *       "audience": "paragraph of text",
   *       "finances": "paragraph of text",
   *       "goal": "paragraph of text",
   *       "mission": "paragraph of text",
   *       "whyThisWhyNow": "paragraph of text",
   *       "id": "956460fe-9635-4618-b1cb-a407d1445d6f"
   *     }
   */
  _get() {
    return function*() {
      const id = this.params.id;
      const filtered = applications.filter((app) => app.id === id);
      if (filtered.length < 1) {
        logger.warn(`Could not find application with id ${id}`)
        this.body = {};
      } else {
        logger.info(`Got application ${JSON.stringify(filtered[0])}`)
        this.body = filtered[0];
      }
    };
  }

  /**
   * Registers routes on the router.
   *
   * @param {Object} router the koa router object.
   */
  register(router) {
    router.post('/application', this._upsert());
    router.get('/application/:id', this._get());
  }
}

function write(applications) {
  fs.writeFileSync('db.json', JSON.stringify(applications));
}

function bootstrapDbFile() {
  try {
    fs.accessSync(path.resolve('./db.json'));
  } catch (e) {
    fs.writeFileSync(path.resolve('./db.json'), JSON.stringify([]));
  }
}
