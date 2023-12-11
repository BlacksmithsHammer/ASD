const reader = require("xlsx")
const fs = require("fs")
const os = require("os");
const { exec } = require("child_process");

function main(path) {
    
    try {
        fs.rmSync("hashcat.potfile")
        fs.rmSync("unhashed.txt")
    } catch { }
    finally {
        const file = reader.readFile(path)
        res = []
        let data = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]])
        let base = [data[0]["__EMPTY_1"], data[1]["__EMPTY_1"], data[2]["__EMPTY_1"], data[3]["__EMPTY_1"], data[4]["__EMPTY_1"]]
        data.forEach(e => { res.push(e["Номер телефона"]) });
        res = res.join(os.EOL)

        fs.writeFileSync("hashedNumbers.txt", res)
        
        a = performance.now()
        exec("hashcat -m 0 -a 3 hashed.txt ?d?d?d?d?d?d?d?d?d?d?d -o unhashed.txt", (error, stdout, stderr) => {
            console.log("hashcat end")
            let unhashed = fs.readFileSync("unhashed.txt", "utf-8").split(os.EOL)
            unhashed.pop()

            HT = new Set()


            for (i in unhashed) { HT.add(unhashed[i].split(":")[1]) }
            salt = 0;
            while (!(HT.has(+base[0] + salt + "") && HT.has(+base[1] + salt + "") && HT.has(+base[2] + salt + "") && HT.has(+base[3] + salt + "") && HT.has(+base[4] + salt + "")))
                salt += 1

            console.log("salt: ", salt)
            res = []
            for (i in unhashed) { res.push(unhashed[i].split(":")[1] - salt) }

            fs.writeFileSync("result.txt", res.join(os.EOL))

            console.log(performance.now() - a, "ms")

        });
    }

}


main("../encrypted_files/scoring_data_v.1.7.xlsx")

