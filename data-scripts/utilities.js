require('dotenv').config();
const fs = require('fs');
const PromisePool = require('es6-promise-pool');
/////////////////////////// Utilities Start \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
module.exports = {
  locales: ['ar', 'en'],
  supportedBrands: [
    "Ariston",
    "BaByliss",
    "Indesit",
    "Ultra",
    "iCook",
    "Crafft",
    "Braun",
    "Miele"
  ],
  semiSupportedBrands: [
    "Toshiba",
    "Zanussi",
    "Kiriazi",
    "White Point"
  ],
  readJSON(fileName) {
    return new Promise((resolve, reject) => {
      fs.readFile(fileName, (err, data) => {
        if(err) {
          reject(err);
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          reject(e);
        }
      });
    });
  },
  writeJSON(fileName, obj) {
    return new Promise((resolve, reject) => {
      // console.log('Saving data to:\n\t', fileName);
      fs.writeFile(fileName, JSON.stringify(obj, null, 2), err => {
      if (obj.constructor.name === 'Array') {
        console.log('Items Count:', obj.length);
      }
        if (err) {
          console.error('Error Saving file!', err);
          reject(err);
        } else {
          console.log('Saved File to:\n\t', fileName);
          resolve(obj);
        }
      });
    });
  },
  normalize(str = '') {
    return str.replace(/[\\/+*&_-]/g, ' ').replace(/\s+/g, '-').toLowerCase();
  },
  * chainGenerators(...generators) {
    for (let generator of generators) {
      let name = null;
      if (generator.constructor.name === 'Object') {
        name = generator.name;
        generator = generator.generator;
      }
      console.log('Generator:', name || generator);
      for (let promise of generator) {
        yield promise;
      }
    }
  },
  * chainPromises(...promisesCreators) {
    for (let promiseCreator of promisesCreators) {
      yield promiseCreator();
    }
  },
  flattenCategories(categoriesList, flattenedCategories) {
    for (let category of categoriesList) {
      flattenedCategories.push(category);
      if (category.children_data && category.children_data.length) {
        let children = category.children_data;
        children.forEach(childCategory => childCategory.parent_magento_id = category.magentoId);
        category.children_data = undefined;
        category.has_children = true;
        this.flattenCategories(children, flattenedCategories);
      }
    }
    return flattenedCategories;
  }
}

/////////////////////////// Utilities End \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
