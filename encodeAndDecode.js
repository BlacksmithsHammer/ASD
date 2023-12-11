const reader = require("xlsx")
const fs = require("fs")
const os = require("os");
const crypto = require("crypto");
const { exec } = require("child_process");


function hash(s, h){ return crypto.createHash(h).update(s).digest("hex")}

function encode_phones(path, h, salt, output) {
    phones = fs.readFileSync(path, "utf8").split(os.EOL)
    res = []
    phones.forEach(e => { res.push(hash(+e + salt + "", h)) });
    fs.writeFileSync(output, res.join(os.EOL))
}

function decode_phones(path, h, salt, outputEncoded, outputDecoded){
    encode_phones(path, h, salt, outputEncoded)
    a = performance.now()

    //m=1700 - sha 512, m=1400 - sha256, m=100 - sha1

    exec(`hashcat -m 1700 -a 3 ${outputEncoded} ?d?d?d?d?d?d?d?d?d?d?d -o ${outputDecoded}`, (error, stdout, stderr) => {
        

        console.log(performance.now() - a, "ms")

    });
    
}



decode_phones("result.txt", "sha512", 0, "encoded_sha256.txt", "decoded_sha256.txt")
