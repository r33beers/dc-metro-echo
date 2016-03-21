var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var install = require('gulp-install');
var zip = require('gulp-zip');
var AWS = require('aws-sdk');
var fs = require('fs');
var runSequence = require('run-sequence');
var tape = require('gulp-tape');
var faucet = require('faucet');
var semistandard = require('gulp-semistandard');

gulp.task('upload', function () {
  AWS.config.region = 'us-east-1';
  var lambda = new AWS.Lambda();
  var functionName = 'MetroTransit';

  lambda.getFunction({FunctionName: functionName}, function (err, data) {
    if (err) {
      var warning;
      if (err.statusCode === 404) {
        warning = 'Unable to find lambda function ' + functionName + '. ';
        warning += 'Verify the lambda function name and AWS region are correct.';
        gutil.log(warning);
      } else {
        warning = 'AWS API request failed. ';
        warning += 'Check your AWS credentials and permissions.';
        gutil.log(warning);
      }
      throw new Error(err);
    }

    var params = {
      FunctionName: functionName
    };

    fs.readFile('./dc-metro-echo.zip', function (err, data) {
      if (err) {
        var warning = 'Error creating zip.';
        gutil.log(warning);
        throw new Error(err);
      } else {
        params.ZipFile = data;
        lambda.updateFunctionCode(params, function (err, data) {
          if (err) {
            var warning = 'Package upload failed. ';
            warning += 'Check your iam:PassRole permissions.';
            gutil.log(warning);
            throw new Error(err);
          }
        });
      }
    });
  });
});
