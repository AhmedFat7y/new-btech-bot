"use strict";
const async = require('async');
const StateBase = require('./state-base');

const NAVIGATION_ACTIONS = {
  NONE: -1,
  SHOW_CHILDREN: 1,
  GO_BACK: 2,
}

const {MAX_QUICK_REPLIES} = require('../../config');

class StateListCategories extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
  }
  
  createBackButton(categoriesTree, categoryPath) {
    let self = this;
    let key = 'shopping',
      action = NAVIGATION_ACTIONS.GO_BACK,
      category = categoryPath.length? null: {children: categoriesTree};
      for (let categoryId of categoryPath) {
        category = categories.children[categoryId];
      }
    return {
      content_type: "text",
      title: self.localesManager.buttons.goBack,
      payload: JSON.stringify({
        text: category.name,
        categoryId: category.magentoId,
        categoryPath,
        action,
        key,
      }),
    }
  }
  createCategoryQuickReply(categoriesTree, categoryPath, category) {
    let action = NAVIGATION_ACTIONS.NONE,
        key = 'categoryFilters';
    if (category.children) {
      key = 'shopping';
      action = NAVIGATION_ACTIONS.SHOW_CHILDREN;
    }
    return {
      content_type: "text",
      title: category.name,
      payload: JSON.stringify({
        text: category.name,
        categoryId: category.magentoId,
        categoryPath,
        action,
        key,
      }),
    }
  }
  constructReply(categoriesTree) {
    const self = this;
    let extraData = self.stateManager.data.incomingMessage.extraData;
    let categoryPath, action, categoryId;
    ({categoryPath, action, categoryId} = extraData);
    let currentLevelCategories = categoriesTree;
    categoryPath = categoryPath || [];
    let newCategoryPath = [...categoryPath];
    if (categoryId && action !== NAVIGATION_ACTIONS.GO_BACK) {
      newCategoryPath.push(categoryId);
    }
    for (let categorryId of newCategoryPath) {
      currentLevelCategories = categoriesTree[categorryId].children;
    }
    let quickRepliesList = Object.keys(currentLevelCategories).map(categoryId => {
      let currentCategory = currentLevelCategories[categoryId];
      return this.createCategoryQuickReply(categoriesTree, newCategoryPath, currentCategory);
    });
    newCategoryPath.length && quickRepliesList.push(this.createBackButton(categoriesTree, categoryPath));
    return {
      text: self.localesManager.questions.pickShoppingCategory,
      quick_replies: quickRepliesList,
    }
  }

  execute(callback) {
    console.log('Executing State categories');
    
    this.prompt(callback);
  }
  
  getCategories(callback) {
    let {categoriesTree} = this.stateManager.data.incomingMessage.extraData;
    if (categoriesTree) {
      callback(null, categoriesTree);
    } else {
      this.repo.getCategoriesTree()
      .lean()
      .exec((err, kvObject) => {
        callback(err, kvObject.value);
      });
    }
  }

  prompt(callback) {
    let self = this;
    async.waterfall([
      nextFunc => self.getCategories(nextFunc)
    ], (err, categories) => {
      self.managePrompts(self.constructReply(categories), callback);
    });
  }
  //
  //
  // constructFailurePrompt() {
  //   const self = this;
  //   return {
  //     text: self.localesManager.validations.enterValidCategory
  //   };
  // }
  //
  // constructSuccessPrompt() {
  //   return {
  //     text: "This is valid category!"
  //   };
  // }
  //
  // verifyInput(callback) {
  //   console.log('Verifying Inputs in state list categories');
  //   let {incomingMessage, user} = this.stateManager.data;
  //   let category = incomingMessage.extraData.category;
  //   if (category) {
  //     user.filters.currentCategory.name = category.name;
  //     user.filters.currentCategory.magentoId = category.magentoId;
  //     //user.markModified('filters.currentCategory');
  //     callback(null, true);
  //   } else {
  //     callback(null, false);
  //   }
  // }
}
module.exports = StateListCategories;
