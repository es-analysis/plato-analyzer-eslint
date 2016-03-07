
var eslint = require('eslint');

module.exports = function(config, logger) {
  
  config = config || {};
  
  if (!('useEslintrc' in config)) config.useEslintrc = true;

  var cli = new eslint.CLIEngine(config);

  return {
    aggregate: function(reports, done) {
      var defaultStructure = {
        totalWarnings: 0,
        totalErrors: 0,
        mostErrors: {
          file: '',
          num: 0
        },
        mostWarnings: {
          file: '',
          num: 0
        }
      };

      var aggregateStats = function(p, n){
        var numErrors = n.report.errorCount;
        var numWarnings = n.report.warningCount;
        p.totalWarnings += numWarnings;
        p.totalErrors += numErrors;
        if (numErrors > p.mostErrors.num) p.mostErrors = { file: n.file, num: numErrors };
        if (numWarnings > p.mostWarnings.num) p.mostWarnings = { file: n.file, num: numWarnings };
        return p;
      };

      var result = reports.reduce(aggregateStats, defaultStructure);
      done(null, result);
    },
    run: function(name, src, done) {
      logger.silly('running eslint on %s', name);
      var results = cli.executeOnText(src).results[0];
      results.filePath = name;
      console.log(results);

      done(null, results);
    }
  }
};

