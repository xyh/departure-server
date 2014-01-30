var cronJob = require('cron').CronJob;
var argv = require('optimist').argv;
var _ = require('underscore');

var tasks = _.sortBy(require('config').cronjob.jobs, function(t) { return (t.order ? t.order : 0); });
console.log('Reading configuration file for the tasks...');
console.log('Tasks read: \n' + JSON.stringify(tasks));

var runTask = function(task) {
    var taskWorker = require('./' + task.name + 'TaskWorker.js');
    if (argv.o) {
        console.log('Running ' + task.name + ' once...');
        taskWorker.work();
    } else {
        console.log('Running task [' + task.name + '] with pattern ' + task.pattern);
        new cronJob(task.pattern, function(){
            taskWorker.work();
        }, null, true);
    }
}

var tasksCount = tasks.length;
for (var i = 0; i < tasksCount; i++) {
    var task = tasks[i];
    if (task && task.name && task.pattern) {
        runTask(task);
    }
}

