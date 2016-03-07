
var assert = require('assert');
var path = require('path');
var fs = require('fs');

var async = require('async');

var analyzer = require('../');

var read = function(file) { return fs.readFileSync(file, 'utf-8') };

var files = [
  path.join(__dirname, 'fixtures', 'a.js'),
  path.join(__dirname, 'fixtures', 'b.js'),
];

files = files.map(function(file) {return {file: file, src: read(file)}});

// TODO use js-schema to assert on the output

describe('analyzer-eslint', function(){
  describe('single file analysis', function(){
    var instance, report;
    beforeEach(function(done){
      instance = analyzer();
      instance.run(files[0].file, files[0].src, function(err, rep) {
        if (err) return done(err);
        report = rep;
        done();
      });

    });

    it('should report the required fields', function(){
      assert.equal(report.messages.length, 2);
    });
    
    
  });
  describe('aggregation', function(){
    var instance, reports, summary;
    
    beforeEach(function(done){
      instance = analyzer();
      async.parallel(files.map(function(file){return function(cb){
        instance.run(file.file, file.src, function(err, result) {
          if (err) return cb(err);
          cb(null, {file: file.file, report: result});
        });
      };}), function(err, results) {
        if (err) return done(err);
        reports = results;
        instance.aggregate(reports, function(err, aggregate) {
          if (err) return done(err);
          summary = aggregate;
          done();
        });
      });
    });
    
    it('should report summaries', function() {
      assert.equal(summary.totalWarnings, 0);
      assert.equal(summary.totalErrors, 2);
      assert.equal(summary.mostErrors.file, files[0].file);
    });

  });

});