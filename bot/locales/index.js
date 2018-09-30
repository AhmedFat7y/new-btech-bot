const texts = {
  en: require('../locales/en'),
  ar: require('../locales/ar')
};
const customIntl = require('intl');
const options = {useGrouping: false};
const currencyOptions = {useGrouping: false, style: 'currency', currency: 'EGP'};
const priceFormatter = {
  en: new customIntl.NumberFormat('en-US', currencyOptions),
  ar: new customIntl.NumberFormat('ar-EG', currencyOptions)
}
const numberFormatter = {
  en: new customIntl.NumberFormat('en-US', options),
  ar: new customIntl.NumberFormat('ar-EG', options),
};

class LocalesManager {
  constructor(stateManagerOrLocale) {
    if (stateManagerOrLocale && (stateManagerOrLocale.constructor.name === 'String')) {
      this.locale = stateManagerOrLocale;
    } else {
      this.stateManager = stateManagerOrLocale;
    }
    this.gender = 'male';
    this.appendLocaleKeys();
  }

  appendLocaleKeys() {
    const self = this;
    Object.keys(texts.en).forEach(key => {
      Object.defineProperty(self, key, {
        get: () => {
          return texts[this.locale][key]
        }
      });
    });
  }
  
  get priceFormatter() {
    return priceFormatter[this.locale];
  }

  get numberFormatter() {
    return numberFormatter[this.locale];
  }
  
  setLocale(locale) {
    this.locale = locale.slice(0, 2);
  }

  getLocale() {
    return this.locale;
  }

  setGender(gender) {
    this.gender = gender;
  }

  formatNumber(number)  {
    return this.numberFormatter.format(number);
  }

  formatPrice(number) {
    return this.priceFormatter.format(number);
  }
  isRTL() {
    return this.locale === 'ar';
  }
  toggleLanguage() {
    if (this.locale === 'en') {
      this.locale = 'ar';
    } else {
      this.locale = 'en';
    }
  }
}

module.exports = LocalesManager;