const sharp = require('sharp');
const readlineSync = require('readline-sync');
const fs = require('fs');

const asciiChars = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ".split('');
const charLength = asciiChars.length;
const interval = charLength / 256;
let newHeight = null;

async function main(newWidth = 100) {
	const newImgData = await pixelToAscii(resizeImg(convertToGrayscale(loadFileFromPath())));
	const pixels = newImgData.length;
	let ascii = '';

	for (let i = 0; i < pixels; i += newWidth) {
		let line = newImgData.split('').slice(i, i + newWidth);
		ascii = ascii + '\n' + line;
	}

	setTimeout(() => {
		fs.writeFile('output.txt', ascii, () => {
			console.log('done');
		});
	}, 5000);
}

async function convertToGrayscale(path) {
	const img = await path;
	const bw = await img.gamma().greyscale();
	return bw;
}

async function resizeImg(bw, newWidth = 100) {
	const blackAndWhite = await bw;
	const size = await blackAndWhite.metadata();
	const ratio = size.width / size.height;
	newHeight = parseInt(newWidth * ratio);
	const resized = await blackAndWhite.resize(newWidth, newHeight, {
		fit: 'outside',
	});

	return resized;
}

async function pixelToAscii(img) {
	let newImg = await img;
	const pixels = await newImg.raw().toBuffer();
	let characters = '';

	pixels.forEach(pixel => {
		characters = characters + asciiChars[Math.floor(pixel * interval)];
	});

	return characters;
}

async function loadFileFromPath() {
	let filePath = readlineSync.question(`What's the file path `);

	try {
		const file = await sharp(filePath);
		return file;
	} catch (err) {
		console.error(err);
	}
}

main();