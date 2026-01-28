const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../uploads/product-images/pen-1769592595611-896650486.jpg');

console.log('--- Image Debug Report ---');
console.log(`Target File: ${filePath}`);

try {
    if (fs.existsSync(filePath)) {
        console.log('✅ File EXISTS.');

        const stats = fs.statSync(filePath);
        console.log(`Size: ${stats.size} bytes`);
        console.log(`Mode: ${stats.mode}`);
        console.log(`Created: ${stats.birthtime}`);

        // Check magic number
        const buffer = Buffer.alloc(4);
        const fd = fs.openSync(filePath, 'r');
        fs.readSync(fd, buffer, 0, 4, 0);
        fs.closeSync(fd);

        console.log(`Magic Bytes: ${buffer.toString('hex').toUpperCase()}`);

        if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
            console.log('✅ Valid JPEG Header detected.');
        } else {
            console.log('❌ INVALID Header. Not a standard JPEG.');
        }

    } else {
        console.log('❌ File does NOT exist at this path.');

        // List directory to see what IS there
        const dir = path.dirname(filePath);
        if (fs.existsSync(dir)) {
            console.log(`Directory ${dir} exists. Contents:`);
            const files = fs.readdirSync(dir);
            files.forEach(f => {
                if (f.startsWith('pen')) console.log(` - ${f}`);
            });
        } else {
            console.log(`❌ Directory ${dir} also does NOT exist.`);
        }
    }
} catch (err) {
    console.error('❌ Error assessing file:', err);
}
