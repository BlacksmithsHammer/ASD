const fs = require("fs");
const os = require("os");
const nReadlines = require('n-readlines');
const input = require('input')



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


function makeData(N, FileName) {
    const p_domains     = fs.readFileSync('option_files/mails.txt', 'utf-8').split(os.EOL)
    const p_names       = fs.readFileSync('option_files/namesForMail.txt', 'utf-8').split(os.EOL)
    const p_platforms   = fs.readFileSync('option_files/platforms.txt', 'utf-8').split(os.EOL)
    const p_objadv      = fs.readFileSync('option_files/objadv.txt', 'utf-8').split(os.EOL)
    const data          = fs.readFileSync('option_files/IPmask.txt', 'utf-8').split(os.EOL)
    const dct_typesAdv = [[],[],[],[],[],[],[],[],[],[],[],[]]

    fs.rmSync('tmp_files', { recursive: true, force: true });
    fs.mkdirSync('tmp_files', { recursive: true })

    console.log('Start')
    //start generate emails
    
    K = 1
    K += 1
    while (K**3 <= N) K += 1
    
    const s1 = [], s2 = [], s3 = [];
    let step = Math.floor(p_names.length/K)
    for (let k1 = 0, k2 = step; k1 < p_names.length; k1 += step, k2 += step){

        if (k2 >=  p_names.length) k2 = p_names.length - 1
        s1.push(p_names[getRandomInt(k1, k2)]);
        s2.push(p_names[getRandomInt(k1, k2)]);
        s3.push(p_names[getRandomInt(k1, k2)]);
    }



    for (let e1 in s1){
        clearLastLine()
        console.log("working... generating emails: ", Math.floor(e1/s1.length*100), '%')
        let data = ''
        for (let e2 in s2)
            for (let e3 in s3)
                data = data + s1[e1] + s2[e2] + s3[e3] + p_domains[getRandomInt(0, p_domains.length - 1)] + os.EOL;

        fs.appendFileSync('tmp_files/mails.txt', data)
    }
    clearLastLine()
    console.log("working... generating emails: 100%")
    console.log('wait...')
    //end generate emails

    //-----------------------------------------------------------------------------------------------


    //start generate ip


    for (let i = 0; i < data.length; i++) {
        data[i] = data[i].split(':')
        data[i][0] = parseInt(data[i][0], 16)
        data[i][1] = parseInt(data[i][1], 16)
    }

    function getArrOfIPPlaces() {
        let freeSpace = []
        if (data[0][0] != 0) {
            freeSpace.push([0, data[0][0] - 1])
        }
    
        for (let i = 0; i < data.length - 1; i++) {
            if (data[i + 1][0] - data[i][1] > 1) {
                freeSpace.push([data[i][1] + 1, data[i + 1][0] - 1])
            }
        }
    
        if (((2 ** 32 - 1) - data[data.length - 1][1]) > 0) {
            freeSpace.push([data[data.length - 1][1] + 1, 2 ** 32 - 1])
        }
    
        return freeSpace
    
    }
    
    let places = getArrOfIPPlaces()
    
    
    let maxNumberOfIp = 0
    
    for (let i = 0; i < places.length; i++){
        maxNumberOfIp += (places[i][1] - places[i][0] + 1)
    }
    
    step = Math.floor((maxNumberOfIp) / N)
    let k = places[0][0]
    let currentRange = 0
    
    let result = ""
    let tmpStr = ""
    
    let counterIPs = 0
    while ((maxNumberOfIp - step) > -1){
        let prevNum = k
        let ind = getRandomInt(0, step - 1);
        while(k + ind > places[currentRange][1]){
            ind = places[currentRange][1] - k - 1
            k = places[currentRange + 1][0]
            currentRange += 1
        }
    
        //result.push(k + ind)
        tmpStr = (k + ind).toString(16)
        result = result + '0'.repeat(8 - tmpStr.length) + tmpStr + os.EOL
    
        counterIPs += 1
        k = prevNum + step
        
        maxNumberOfIp -= step
    
    
        if (counterIPs % 10000 == 0) {
            fs.appendFileSync("tmp_files/ip.txt", result)
            result = ''
            clearLastLine()
            console.log('working... generating ip\'s: ', Math.floor((counterIPs/N)*100), '%')
        }
    }
    fs.appendFileSync("tmp_files/ip.txt", result)
    clearLastLine()
    console.log('working... generating ip\'s: ', '100%\n')
    
    let fd_ip = fs.openSync('tmp_files/ip.txt', 'rs+')
    let buffer1 = Buffer.alloc(10)
    let buffer2 = Buffer.alloc(10)
    let pos = -1
    for (let i = 0; i < N; i++){
        pos = getRandomInt(0, N-1)
        fs.readSync(fd_ip, buffer1, 0, 10, 10*i);
        fs.readSync(fd_ip, buffer2, 0, 10, 10*pos);
        fs.writeSync(fd_ip, buffer1, 0, 10, 10*pos);
        fs.writeSync(fd_ip, buffer2, 0, 10, 10*i);
        if (i % 10000 == 0) {
            clearLastLine()
            console.log('working... shuffling ip\'s: ', Math.floor((i/N)*100), '%')
        }

    }
    
    clearLastLine()
    console.log('working... shuffling: ', '100%')


    //end generate ip
    //--------------------------------------------------------------------------------------
    //generating platforms, date, counter, time of watch, type of ads and add it with emails and ips in result.txt file

    for (let i = 0; i < p_objadv.length; i++) {
        p_objadv[i] = p_objadv[i].split(';')
        p_objadv[i][1] = p_objadv[i][1].split(',')
        for (let j = 0; j < p_objadv[i][1].length; j++){
            dct_typesAdv[p_objadv[i][1][j] - 1].push(p_objadv[i][0])
        }
    }

    function randomDate(date1, date2){
        function randomValueBetween(min, max) {
          return Math.random() * (max - min) + min;
        }
        var date1 = date1 || '01-01-1970'
        var date2 = date2 || new Date().toLocaleDateString()
        date1 = new Date(date1).getTime()
        date2 = new Date(date2).getTime()
        if( date1>date2){
            return new Date(randomValueBetween(date2,date1)).toLocaleDateString()   
        } else {
            return new Date(randomValueBetween(date1, date2)).toLocaleDateString()  
        }
    }
    
    //MM/DD/YYYY
    let d1 = '06/01/2000'
    let d2 = '02/13/2013'
    
    
    function getRandomMonth (d1, d2){
        let arrd = []
        let kd_start = +(d1[0] + d1[1])
        let kd_end   = +(d2[0] + d2[1])
        kd_start--
        kd_end--
    
        arrd.push(kd_start)
        while (kd_start != kd_end){
            if (kd_start == 11){
                kd_start = 0
            } else {
                kd_start++
            }
            arrd.push(kd_start)
        }
    
        return arrd[getRandomInt(0, arrd.length-1)]
    
    }
    
    function createNewInfo(){
        let currDate = randomDate(d1, d2)
        let numberOfAdv = getRandomInt(1, 100)
        let coefficient = getRandomInt(20, 360)
        let month = getRandomMonth(d1, d2)
        return [p_platforms[getRandomInt(0, p_platforms.length - 1)], currDate, numberOfAdv, numberOfAdv*coefficient, dct_typesAdv[month][getRandomInt(0, dct_typesAdv[month].length-1)]].join()
    }

    const linerMail = new nReadlines('tmp_files/mails.txt');
    const linerIp = new nReadlines('tmp_files/ip.txt');
    let lineMail
    let lineIp
    let lineNumber = 0


    let res_data = []
    console.log('wait...')
    while (lineNumber < N) {
        lineMail = linerMail.next().toString('utf-8')
        lineIp   = linerIp.next().toString('utf-8')

        lineMail = lineMail.slice(0, lineMail.length - 1)
        lineIp   = lineIp.slice(0, lineIp.length - 1)
        let lineIpNormal = String(parseInt(lineIp[0] + lineIp[1], 16)) + '.' + String(parseInt(lineIp[2] + lineIp[3], 16)) + '.' + String(parseInt(lineIp[4] + lineIp[5], 16)) + '.' + String(parseInt(lineIp[6] + lineIp[7], 16))
        let info = createNewInfo()
        res_data.push([lineMail, lineIpNormal, info].join() + os.EOL)

        
        if (lineNumber % 10000 == 0){
            fs.appendFileSync('tmp_files/' + FileName + '.csv', res_data.join(''))
            res_data = []
            clearLastLine()
            console.log('working... writing data into file: ', Math.floor(lineNumber/N*100), '%')
        }

        lineNumber++
    }

    fs.appendFileSync('tmp_files/' + FileName + '.csv', res_data.join('').substring(0, res_data.join('').length - os.EOL.length))
    clearLastLine()
    console.log('working... writing data into file: ', '100%')
    //createNewInfo()

    
}

//makeData(100000)



function UI() {

    function isNumeric(str) {
        if (typeof str != "string") return false // we only process strings!  
        return !isNaN(str) && !isNaN(parseFloat(str))
    }

    async function ask() {
        let N = await input.text('Write number of strings :',
            {
                default: '100000',
                validate(answer) {
                    if (isNumeric(answer)) return true;
                    return `write only numbers: `;
                }
            }
        );

        let FileName = await input.text('Write name of file, example - mydata\nfile will be in ./tmp_files/filename.csv',
            {
                default: 'data',
                validate(answer) {
                    if (answer.length > 0) return true;
                    return `i dont know what are you doing... repeat please: `;
                }
            }
        );



        makeData(+N, FileName)
        console.log('\nprogram done!')
    }

    ask();
}

UI()


