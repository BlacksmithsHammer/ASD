const fs = require("fs");
const os = require("os");
const nReadlines = require('n-readlines');
const input = require('input');
const { inflate } = require("zlib");




// min and max included
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max) + 1;
    return Math.floor(Math.random() * (max - min)) + min;
}
// clear last line in output console stream
const clearLastLine = () => {
    process.stdout.moveCursor(0, -1)
    process.stdout.clearLine(1)
}



function calcMinKanon (arr, ids = [0, 1, 2, 3, 4, 5, 6], info = false){
    ids.sort()
    dct = new Map()
    for (let i = 0; i < arr.length; i++){
        
        dct_key = []
        for (val of ids) dct_key.push(data[i][val])
        dct_key = dct_key.join()

        if (dct.has(dct_key)){
            dct.set(dct_key, dct.get(dct_key) + 1)
        } else {
            dct.set(dct_key, 1)
        }
    }
    mn = Infinity

    bad = new Array(data.length + 1).fill(0);
    for (let [key, val] of dct){
        if (val < mn) {
            mn = val
        }
        bad[val] += val;
    }

    if (info) {
        i = 1; 
        counter = 0
        while (i < bad.length && counter < 5){
            if (bad[i] > 0){
                console.log("Bad K: " + i + ", " + bad[i]/data.length*100 + " % of all dataset")
                counter++
            }
            i++
        }
    }
    return mn
    
}

function main(FileName, mainAction, actions){

    data = fs.readFileSync(FileName, 'utf-8').split(os.EOL)
    for (let i = 0; i < data.length; i++){
        data[i] = data[i].split(',')
    }

    

    if (mainAction == 'Depersonalize data') {
        ids = []
        actions.forEach(action => {

            if (action == 'Delete ip'){
                ids.push(1)
                for (let i = 0; i < data.length; i++){
                    data[i][1] = 'NONE';
                }
            }


            if (action == 'Platform masking'){
                ids.push(2)
                for (let i = 0; i < data.length; i++){
                    data[i][2] = data[i][2].substr(data[i][2].indexOf('.') + 1);
                }
            }


            if (action == 'Date masking'){
                ids.push(3)
                for (let i = 0; i < data.length; i++){
                    data[i][3] = data[i][3][3] + data[i][3][4];
                }
            }


            if (action == 'Locale generalization of adv number'){
                ids.push(4)
                for (let i = 0; i < data.length; i++){
                    data[i][4] = +data[i][4] > 50 ? '>50' : '<=50';
                }
            }

            if (action == 'Delete time of watch'){
                ids.push(5)
                for (let i = 0; i < data.length; i++){
                    data[i][5] = 'NONE';
                }
            }

            if (action == 'Micro-agregation of adv-type'){
                ids.push(6)
                for (let i = 0; i < data.length; i++){
                    data[i][6] = data[i][6].split(' ').length == 1 ? data[i][6] : data[i][6].split(' ')[0];
                }
            }

            if (action == 'Delete e-mail'){
                ids.push(0)
                for (let i = 0; i < data.length; i++){
                    data[i][0] = 'NONE'
                }
            }



        });

        ids.sort()

        targetK = 5
        if (data.length < 105000) targetK = 7
        if (data.length < 51000) targetK = 10


        result = []
        if (calcMinKanon(data, ids, false) < targetK){

            dct = new Map()
            for (let i = 0; i < data.length; i++) {

                dct_key = []
                for (val of ids) dct_key.push(data[i][val])
                dct_key = dct_key.join()

                if (dct.has(dct_key)) {
                    dct.set(dct_key, dct.get(dct_key) + 1)
                } else {
                    dct.set(dct_key, 1)
                }
            }

            for (let i = 0; i < data.length; i++){
                curr_key = []
                for (val of ids) curr_key.push(data[i][val])
                curr_key = curr_key.join()
                if (dct.get(curr_key) >= targetK) result.push(data[i])
            }

        } else {
            result = data
        }
        
        

        for (let i = 0; i < result.length; i++){
            result[i] = result[i].join()
        }
        console.log("data conservation: " + result.length/data.length*100 + '%')
        fs.writeFileSync("result.csv", result.join(os.EOL));
    }


    if (mainAction == 'Calculate k-anonymity') {
        ids = []
        actions.forEach(action => {
            if (action == 'Delete ip') ids.push(1)
            if (action == 'Platform masking') ids.push(2)
            if (action == 'Date masking') ids.push(3)
            if (action == 'Locale generalization of adv number') ids.push(4)
            if (action == 'Delete time of watch') ids.push(5)
            if (action == 'Micro-agregation of adv-type') ids.push(6)
            if (action == 'Delete e-mail') ids.push(0)
        });

        console.log("Minimum K: ", calcMinKanon(data, ids, true))
    }
}



function UI() {
    async function ask() {
        let FileName = await input.text('Write full name of file, example - mydata.csv: ',
            {
                default: 'data.csv',
                validate(answer) {
                    if (!fs.existsSync(answer)) {
                        return `file doesnt exist, try again: `;
                    }
                    return true;
                }
            }
        );
        const actions = await input.checkboxes(`Choose methods of anonymity: `, [
            'Delete ip', 'Platform masking', 'Date masking', 'Locale generalization of adv number', 'Delete time of watch', 'Micro-agregation of adv-type', 'Delete e-mail'
        ], 
        {
            validate(answer) {
                if (answer.length == 0){
                    return 'choose at least ONE POINT...'
                }

                return true
            }
        });

        const mainAction = await input.select('What to do with that methods? ', ['Depersonalize data', 'Calculate k-anonymity'])

        main(FileName, mainAction, actions)
        
    }

    ask();
}

UI()


