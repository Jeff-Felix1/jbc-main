const bcrypt = require('bcrypt');

async function generateHash(password) {
    const saltRounds = 3;
    const hash = await bcrypt.hash(password, saltRounds);
    console.log("Hash gerado:", hash);
}

generateHash("123");
