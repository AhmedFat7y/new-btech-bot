module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [

    // First application
    {
      name: 'bot-btech',
      script: 'bin/www',
      'node_args': '-r dotenv/config',
      env: {
        COMMON_VARIABLE: 'true'
      },
      'env_staging': {
        NODE_ENV: 'development',

      },
      'env_production': {
        'NODE_ENV': 'production',
        'instances' : 'max',
        'exec_mode' : 'cluster'
      }
    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy: {
    staging: {
      user: 'enuma',
      host: 'www.kanshoubakuya.com',
      key: '~/.ssh/fat7y',
      ref: 'origin/master',
      repo: 'git@github.com:AhmedFat7y/new-btech-bot.git ',
      path: '/var/www/nodejs/bot-btech',
      'post-deploy': '. ~/.zshrc; yarn install && pm2 startOrRestart ecosystem.config.js --env staging'
    },
    production: {
      user: 'deployer',
      host: '37.48.90.219',
      key: '~/.ssh/fat7y',
      ref: 'origin/master',
      repo: 'git@github.com:AhmedFat7y/new-btech-bot.git ',
      path: '/home/deployer/bot',
      'post-deploy': 'source ~/.profile && yarn install && authbind --deep pm2 startOrRestart ecosystem.config.js --env production'
    }
  }
};
