let { Category } = require('../models/category');
let { Product } = require('../models/product');
let { KVStore } = require('../models/kv-store');
let {Message} = require('../models/message');
let {Groups} = require('../models/groups');
let Issue = require('../models/issue'); 
 
module.exports = class Repo {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.localesManager = stateManager.localesManager;
  }

  get Groups() {
    return Groups[this.localesManager.getLocale()];
  }
  get Product() {
    return Product[this.localesManager.getLocale()];
  }

  get Category() {
    return Category[this.localesManager.getLocale()];
  }

  get KVStore() {
    return KVStore[this.localesManager.getLocale()];
  }
  get Message() {
    return Message;
  }
  get Issue() {
    return Issue; 
  }
  getCategoryByMagentoId(magentoId) {
    return this.Category.findOne({ magentoId: magentoId });
  }

  //get category by normalized Name
  getCategoryByNormalizedName(normalizedName){
    return this.Category.findOne({normalizedName:normalizedName});
  }
  getAllCategoriesForQuickReplies() {
    return this.Category.find({}).select('magentoId name parentMagentoId normalizedName -_id');
  }
  getCategoriesModel() {
    return this.Category;
  }
  getProduct(magentoId, callback) {
    return this.Product.findOne({ magentoId });
  }
  getProductsQueryObject(baseQuery = {}) {
    return this.Product.find(baseQuery || {});
  }

  getDailyDealsProducts() {
    return this.Product.find({ hasOffer: true });
  }

  getSupportedCategories() {
    return this.Category.find({supported: true});
  }

  getCategoryBrands(categoryMagentoId) {
    return this.Category.findOne({ magentoId: categoryMagentoId }, {brands: 1, _id: 0});
  }

  getSupportedBrands(categoryMagentoId, callback) {
    return this.Category.findOne({magentoId: categoryMagentoId}, {brands: 1, _id: 0}).lean().exec((err, category) => {
      if (err) {
        return callback(err);
      }
      let supportedBrands = category.brands.filter(brand => brand.supported);
      callback(err, supportedBrands);
    });
  }

  getNotSupportedBrands() {
    return this.KVStore.findOne({ key: 'maintenance-other-brands', locale: this.localesManager.getLocale() });
  }

  getCategoriesTree() {
    return this.KVStore.findOne({ key: 'categories-tree', locale: this.localesManager.getLocale() });
  }
  getPreviousMessage(fbId) {
    return this.Message.findOne({fbId: fbId, replied: true, isFailure: false}).sort({'timestamp': -1})
  }

  saveIssue(user, text, callback) {
      let issue = new this.Issue({
        name: user.firstName + " " + user.lastName,
        phone: user.phone, 
        fbId: user.fbId,
        text:text     
      });
      issue.save(function(err) {
        console.log("REPO SAVING");
        if (err) {
          return console.error('Error saving complain/ Returning number:', err);
        }
        return callback(issue.complaintNo);
      });
  }
};
