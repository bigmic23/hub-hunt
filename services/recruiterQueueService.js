let queues = {};

function push(userId, job) {

if (!queues[userId]) {
queues[userId] = [];
}

queues[userId].push(job);

queues[userId].sort(
(a,b)=>
(b.score||0)-
(a.score||0)
);

}

function get(userId) {
return queues[userId] || [];
}

function shift(userId) {

if (!queues[userId]) {
return null;
}

return queues[userId].shift();

}

function clear(userId) {
queues[userId]=[];
}

module.exports = {
push,
get,
shift,
clear
};
