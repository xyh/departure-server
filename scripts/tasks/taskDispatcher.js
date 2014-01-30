var cronJob = require('cron').CronJob;
var argv = require('optimist').argv;
var _ = require('underscore');
var async = require('async');

var command = argv.c;
if (!command) command = "sync";

var tasks = _.sortBy(require('config').cronjob[command], function (t) {
  return (t.order ? t.order : 0);
});
console.log('Reading configuration file for the tasks...');
console.log('Tasks read: \n' + JSON.stringify(tasks));

/* worker queue */
var workerQueue = [];
var runningJob = false;
var checkWorkerQueue = function() {
  setTimeout(function(){
    process.nextTick(function() {
      console.log('Checking worker queue: there are ' + workerQueue.length + ' worker waiting. Running job? ' + runningJob);
      if (workerQueue.length > 0 && !runningJob) {
        runningJob = true;
        var worker = workerQueue[0];
        workerQueue.shift();
        console.log('\n======\nStart running job [' + worker.name + ']...');
        worker.run(null, function() {
            runningJob = false;
            checkWorkerQueue();
        });
      } else if (workerQueue.length <= 0) {
        console.log('No worker current, sleep...');
      } else {
        console.log('A worker is currently running, wait...');
      }
    });
  }, 3000);
}

/* set up cron job */
var pushTask = function (task) {
  var taskWorker = require('./' + task.name + 'TaskWorker.js');
  if (argv.o || !task.pattern) {
    console.log('Push one task [' + task.name + '] into queue.');
    workerQueue.push(taskWorker);
    checkWorkerQueue();
  } else {
    new cronJob(task.pattern, function () {
      console.log('Push task [' + task.name + '] into queue, cron pattern: ' + task.pattern + '. ');
      workerQueue.push(taskWorker);
      checkWorkerQueue();
    }, null, true);
  }
}

var setupCron = function() {
  var tasksCount = tasks.length;
  for (var i = 0; i < tasksCount; i++) {
    var task = tasks[i];
    if (task && task.name) {
      pushTask(task);
    }
  }
}

setupCron();

