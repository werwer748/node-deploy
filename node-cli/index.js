#!/usr/bin/env node
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

console.clear();
const answerCallback = (answer) => {
    if(answer === 'y'){
        console.log('ㄱㅅㄱㅅ!!');
        rl.close();
    } else if (answer === 'n') {
        console.log('ㅈㅅㅈㅅ');
        rl.close();
    } else {
        console.log('y 또는 n만 입력하세요!');
        rl.question('예제가 잼나여? (y/n) ', answerCallback);
    }
};

rl.question('예제가 잼나여? (y/n) ', answerCallback);