'use strict'

/*
	IMPORTANT NOTE
	Hi, 2023 Josh here.
	This code is really, **really** old. There's a lot of amateur mistakes here. 
	Please don't judge too harshly.
*/

//			Loads the canvas.
window.addEventListener('load', loadCanvas)

//			Reloads canvas whenever form is updated. Since you cannot "erase", it gets rewritten every time.
const form = document.getElementById('form')
form.addEventListener('change', loadCanvas)

//			Defines canvas and context for global use.
const canvas = document.getElementById('Fretboard')
const ctx = canvas.getContext('2d')

//			Define colors and stroke thickness.
let fretboardBackgroundColor = '#FEC1AB'
let fretLineColor = '#000000'
let fretLineWidth = 2

//			Initiating global variables to be defined later
let rSF
let tonicNote
let mode
let showFlats
let noteTransparency

//			Choose base notes for custom tuning.

let stringOpenNotes = []

//			Choose how many frets to display
let fretCount = 12

let str1tuning

//			Load functions ran every time the form updates
function loadCanvas() {
	updateCustomTuning()
	//		Determines if Low Resolution is enabled
	if (document.getElementById('lowRes').checked) {
		rSF = 1
	} else {
		rSF = 2
	}

	//		Loads/updates variables for scale
	tonicNote = Number(document.getElementById('scale-letter').value)
	mode = Number(document.getElementById('mode').value)
	showFlats = document.getElementById('sharps').checked

	createScale()
	canvas.style.border = 'none'
	ctx.canvas.width = rSF * 906
	ctx.canvas.height = rSF * 400
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	drawFretboard()
	updateChordSection()
	drawNotes()
	updateScaleNotesDiv()
}

// 			Converts numbers 1-12 to corresponding notes. Can take array or int. Used throughout code.
function numToNote(num) {
	let numList = []

	let noteLetRef = [, 'Ab', 'A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G']
	if (showFlats) {
		noteLetRef = [, 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G']
	}

	if (Array.isArray(num)) {
		numList = num
	} else {
		return noteLetRef[num]
	}

	let letList = []
	for (let i = 0; i < numList.length; i++) {
		letList.push(noteLetRef[numList[i]])
	}
	return letList
}

// 			Generates selected scale in a numeric array.
let activeNotesNum = []
let colorCode = [, , , , , , , , , , ,]
function createScale() {
	activeNotesNum = []
	// 		Catches if Scale is set to custom, reveals options if so
	if (tonicNote == 0) {
		document.getElementById('customNotes').style.display = ''
		document.getElementById('mode').selectedIndex = -1
		colorCode = [, , , , , , , , , , ,]
		//	Toggles between sharp and flat for the custom list
		if (showFlats) {
			document.getElementById('n1d').innerHTML = 'G#'
			document.getElementById('n3d').innerHTML = 'A#'
			document.getElementById('n6d').innerHTML = 'C#'
			document.getElementById('n8d').innerHTML = 'D#'
			document.getElementById('n11d').innerHTML = 'F#'
		} else {
			document.getElementById('n1d').innerHTML = 'Ab'
			document.getElementById('n3d').innerHTML = 'Bb'
			document.getElementById('n6d').innerHTML = 'Db'
			document.getElementById('n8d').innerHTML = 'Eb'
			document.getElementById('n11d').innerHTML = 'Fb'
		}

		// Loads colorCode with assigned colors
		/* colorCode will need another function to assign the correct ones as custom elements are added
		to cList. colorCode will store the color values, but another function will be needed to apply them.
		*/
		if (document.getElementById('n1').checked) {
			activeNotesNum[1] = 1
			colorCode[1] = document.getElementById('n1c').value
		}
		if (document.getElementById('n2').checked) {
			activeNotesNum[2] = 2
			colorCode[2] = document.getElementById('n2c').value
		}
		if (document.getElementById('n3').checked) {
			activeNotesNum[3] = 3
			colorCode[3] = document.getElementById('n3c').value
		}
		if (document.getElementById('n4').checked) {
			activeNotesNum[4] = 4
			colorCode[4] = document.getElementById('n4c').value
		}
		if (document.getElementById('n5').checked) {
			activeNotesNum[5] = 5
			colorCode[5] = document.getElementById('n5c').value
		}
		if (document.getElementById('n6').checked) {
			activeNotesNum[6] = 6
			colorCode[6] = document.getElementById('n6c').value
		}
		if (document.getElementById('n7').checked) {
			activeNotesNum[7] = 7
			colorCode[7] = document.getElementById('n7c').value
		}
		if (document.getElementById('n8').checked) {
			activeNotesNum[8] = 8
			colorCode[8] = document.getElementById('n8c').value
		}
		if (document.getElementById('n9').checked) {
			activeNotesNum[9] = 9
			colorCode[9] = document.getElementById('n9c').value
		}
		if (document.getElementById('n10').checked) {
			activeNotesNum[10] = 10
			colorCode[10] = document.getElementById('n10c').value
		}
		if (document.getElementById('n11').checked) {
			activeNotesNum[11] = 11
			colorCode[11] = document.getElementById('n11c').value
		}
		if (document.getElementById('n12').checked) {
			activeNotesNum[12] = 12
			colorCode[12] = document.getElementById('n12c').value
		}
	} else {
		document.getElementById('customNotes').style.display = 'none'
		// 	Returns to major mode after deselecting custom
		if (document.getElementById('mode').selectedIndex == -1) {
			document.getElementById('mode').selectedIndex = 0
			mode = 1
		}

		//			Generates intervals for selected scale
		let scaleFormula = new Array()
		switch (mode) {
			case 1:
				scaleFormula = [2, 2, 1, 2, 2, 2, 1]
				colorCode = ['#6cb7e6', , , , , , '#b4d7ed']
				break // Ionian
			case 2:
				scaleFormula = [2, 1, 2, 2, 2, 1, 2]
				colorCode = ['#6cb7e6', , , , , '#b4d7ed']
				break // Dorian
			case 3:
				scaleFormula = [1, 2, 2, 2, 1, 2, 2]
				colorCode = ['#6cb7e6', '#b4d7ed', , , , ,]
				break // Phrygian
			case 4:
				scaleFormula = [2, 2, 2, 1, 2, 2, 1]
				colorCode = ['#6cb7e6', , , '#b4d7ed', , ,]
				break // Lydian
			case 5:
				scaleFormula = [2, 2, 1, 2, 2, 1, 2]
				colorCode = ['#6cb7e6', , , , , '#b4d7ed']
				break // Mixolydian
			case 6:
				scaleFormula = [2, 1, 2, 2, 1, 2, 2]
				colorCode = ['#6cb7e6', , , , , , '#b4d7ed']
				break // Aeolian
			case 7:
				scaleFormula = [1, 2, 2, 1, 2, 2, 2]
				colorCode = ['#6cb7e6', , , , , ,]
				break // Locrian
			case 8:
				scaleFormula = [2, 2, 3, 2, 2]
				colorCode = ['#6cb7e6', , , , '#b4d7ed']
				break // Major Pentatonic
			case 9:
				scaleFormula = [3, 2, 2, 3, 3]
				colorCode = ['#6cb7e6', , , , '#b4d7ed']
				break // Minor Pentatonic
			case 10:
				scaleFormula = [2, 3, 2, 3, 3]
				colorCode = ['#6cb7e6', , , , '#b4d7ed']
				break // Egyptian Pentatonic
			case 11:
				scaleFormula = [2, 3, 2, 2, 3]
				colorCode = ['#6cb7e6', , , , '#b4d7ed']
				break // Blues Major Pentatonic
			case 12:
				scaleFormula = [3, 2, 3, 2, 2]
				colorCode = ['#6cb7e6', , , , '#b4d7ed']
				break // Blues Minor Pentatonic
		}

		//			Generates the numeric values for each note in selected scale
		activeNotesNum[0] = tonicNote
		let nextNote = tonicNote
		for (let i = 0; i < scaleFormula.length - 1; i++) {
			nextNote = nextNote + scaleFormula[i]
			if (nextNote > 12) {
				nextNote = nextNote - 12
			}
			activeNotesNum.push(nextNote)
		}
		console.log('Scale Generated: ' + numToNote(activeNotesNum))
	}
}

function drawFretboard() {
	ctx.fillStyle = fretboardBackgroundColor
	ctx.fillRect(rSF * 100, rSF * 50, rSF * 756, rSF * 250)

	ctx.strokeStyle = fretLineColor
	ctx.lineWidth = rSF * fretLineWidth

	function createLine(x1, y1, x2, y2) {
		ctx.moveTo(rSF * x1, rSF * y1)
		ctx.lineTo(rSF * x2, rSF * y2)
		ctx.stroke()
	}

	ctx.beginPath()

	// Vertical Lines
	createLine(100, 50, 100, 300)
	createLine(163, 50, 163, 300)
	createLine(226, 50, 226, 300)
	createLine(289, 50, 289, 300)
	createLine(352, 50, 352, 300)
	createLine(415, 50, 415, 300)
	createLine(478, 50, 478, 300)
	createLine(541, 50, 541, 300)
	createLine(604, 50, 604, 300)
	createLine(667, 50, 667, 300)
	createLine(730, 50, 730, 300)
	createLine(793, 50, 793, 300)
	createLine(856, 50, 856, 300)

	// Horizontal Lines
	createLine(100, 50, 856, 50)
	createLine(100, 100, 856, 100)
	createLine(100, 150, 856, 150)
	createLine(100, 200, 856, 200)
	createLine(100, 250, 856, 250)
	createLine(100, 300, 856, 300)

	// Fret Numbers
	for (let fret = 0; fret < 13; fret++) {
		let fretR = rSF * (131.5 + 63 * (fret - 1))
		ctx.beginPath()
		ctx.fillStyle = 'black'
		ctx.textAlign = 'center'
		ctx.font = 27 * rSF + 'px Arial'
		ctx.fillText(fret, fretR, rSF * 350)
	}
}

function drawNotes() {
	//			Maps all notes in nList, with the corresponding colors in cList, with showSharp toggle.
	function mapNotes(nList, cList, showSharp) {
		//		Function maps a note on fretboard with given arguments
		function createNote(fret, string, noteName, noteColor = '#ffffff', transparency = 'ff') {
			let fretR = rSF * (131.5 + 63 * (fret - 1))
			let stringR = rSF * string * 50

			ctx.beginPath()

			// Crreates a background plate if note is transparent
			if (transparency != 'ff') {
				ctx.arc(fretR, stringR, rSF * 22, 0, 2 * Math.PI)
				ctx.fillStyle = fretboardBackgroundColor
				ctx.fill()
			}

			ctx.arc(fretR, stringR, rSF * 22, 0, 2 * Math.PI)
			ctx.fillStyle = noteColor + transparency
			ctx.fill()
			ctx.strokeStyle = '#000000' + transparency
			ctx.stroke()
			ctx.beginPath()
			ctx.fillStyle = '#000000' + transparency
			ctx.textAlign = 'center'
			ctx.font = 27 * rSF + 'px Arial'
			ctx.fillText(noteName, fretR, stringR + rSF * 10)
		}

		//		Generates an array of notes on a string (numeric), with given fret length
		function generateStringNotes(openNote) {
			let noteLs = [openNote]
			let nextNote = openNote
			for (let i = 0; i < fretCount; i++) {
				nextNote = nextNote + 1
				if (nextNote > 12) {
					nextNote = nextNote - 12
				}
				noteLs.push(nextNote)
			}
			return noteLs
		}

		//		Finds ALL indexes of a value in array
		function findIndexes(value, array) {
			let indexList = []
			for (let i = 0; i < array.length; i++) {
				if (array[i] == value) {
					indexList.push(i)
				}
			}
			return indexList
		}

		//		Checks if a chord is selected, and dims all other notes NOT DONE
		let transArray = activeNotesNum
		for (let i = 1; i <= 7; i++) {
			if (document.getElementById('chord' + i + 'toggle').checked) {
				transArray = chordNotes(
					activeNotesNum[i - 1],
					document.getElementById('chord' + i + 'type').innerHTML
				)
				document.getElementById('showfullscale').style.display = ''
				document.getElementById('showfullscalelabel').style.display = ''
			}
		}
		if (document.getElementById('showfullscale').checked) {
			document.getElementById('showfullscale').style.display = 'none'
			document.getElementById('showfullscalelabel').style.display = 'none'
		}

		//		Places notes in nList on fretboard
		for (let noteIt = 0; noteIt <= nList.length; noteIt++) {
			// Iterates per string per note (in nList)
			for (let stringIt = 0; stringIt < stringOpenNotes.length; stringIt++) {
				// Gets indexes of selected note on selected string
				let indx = findIndexes(
					nList[noteIt],
					generateStringNotes(stringOpenNotes[stringIt])
				)
				// Creates note on canvas for each time the note is found on the string searched
				for (let mapIt = 0; mapIt < indx.length; mapIt++) {
					let transparency = 'ff'
					if (!transArray.includes(nList[noteIt])) {
						transparency = '44'
					}

					createNote(
						indx[mapIt],
						stringIt + 1,
						numToNote(nList[noteIt]),
						cList[noteIt],
						transparency
					)
				}
			}
		}
	}

	//	Generates scale on fretboard.

	mapNotes(activeNotesNum, colorCode, showFlats)
}

function updateScaleNotesDiv() {
	if (tonicNote == 0) {
		document.getElementById('scaleNotes').style.display = 'none'
	} else {
		document.getElementById('scaleNotes').style.display = ''
		let ScaleNoteDiv = 'Notes:'
		for (let i = 0; i < activeNotesNum.length; i++) {
			ScaleNoteDiv = ScaleNoteDiv.concat('\t', numToNote(activeNotesNum[i]))
		}
		document.getElementById('scaleNotes').innerHTML = ScaleNoteDiv
	}
}

function updateCustomTuning() {
	if (!document.getElementById('customTuningToggle').checked) {
		//guitar:
		stringOpenNotes = [9, 4, 12, 7, 2, 9]
		// ukelele:
		// stringOpenNotes = [2, 9, 5, 12]
		document.getElementById('customTuning').style.display = 'none'
	} else {
		document.getElementById('customTuning').style.display = ''
		str1tuning = Number(document.getElementById('str1tuning').value)
		stringOpenNotes[0] = str1tuning
		str1tuning = Number(document.getElementById('str2tuning').value)
		stringOpenNotes[1] = str1tuning
		str1tuning = Number(document.getElementById('str3tuning').value)
		stringOpenNotes[2] = str1tuning
		str1tuning = Number(document.getElementById('str4tuning').value)
		stringOpenNotes[3] = str1tuning
		str1tuning = Number(document.getElementById('str5tuning').value)
		stringOpenNotes[4] = str1tuning
		str1tuning = Number(document.getElementById('str6tuning').value)
		stringOpenNotes[5] = str1tuning
	}
}

//			Gets notes in a chord (major, minor, diminished)
function chordNotes(chordNum, chordType) {
	let retArray = [chordNum]
	switch (chordType) {
		case 'Major':
			retArray[1] = chordNum + 4
			retArray[2] = chordNum + 7
			break
		case 'Minor':
			retArray[1] = chordNum + 3
			retArray[2] = chordNum + 7
			break
		case 'Diminished':
			retArray[1] = chordNum + 3
			retArray[2] = chordNum + 6
			break
	}
	for (let i = 0; i < retArray.length; i++) {
		if (retArray[i] > 12) {
			retArray[i] = retArray[i] - 12
		}
	}
	return retArray
}

function updateChordSection() {
	function displayMajor(chordNum, numeral) {
		document.getElementById('chord' + chordNum + 'numeral').innerHTML = numeral
		document.getElementById('chord' + chordNum + 'name').innerHTML = numToNote(
			activeNotesNum[chordNum - 1]
		)
		document.getElementById('chord' + chordNum + 'type').innerHTML = 'Major'
		let chord = numToNote(chordNotes(activeNotesNum[chordNum - 1], 'Major'))
		document.getElementById('chord' + chordNum + 'note1').innerHTML = chord[0]
		document.getElementById('chord' + chordNum + 'note2').innerHTML = chord[1]
		document.getElementById('chord' + chordNum + 'note3').innerHTML = chord[2]
	}
	function displayMinor(chordNum, numeral) {
		document.getElementById('chord' + chordNum + 'numeral').innerHTML = numeral
		document.getElementById('chord' + chordNum + 'name').innerHTML = numToNote(
			activeNotesNum[chordNum - 1]
		)
		document.getElementById('chord' + chordNum + 'type').innerHTML = 'Minor'
		let chord = numToNote(chordNotes(activeNotesNum[chordNum - 1], 'Minor'))
		document.getElementById('chord' + chordNum + 'note1').innerHTML = chord[0]
		document.getElementById('chord' + chordNum + 'note2').innerHTML = chord[1]
		document.getElementById('chord' + chordNum + 'note3').innerHTML = chord[2]
	}
	function displayDiminished(chordNum, numeral) {
		document.getElementById('chord' + chordNum + 'numeral').innerHTML = numeral
		document.getElementById('chord' + chordNum + 'name').innerHTML = numToNote(
			activeNotesNum[chordNum - 1]
		)
		document.getElementById('chord' + chordNum + 'type').innerHTML = 'Diminished'
		let chord = numToNote(chordNotes(activeNotesNum[chordNum - 1], 'Diminished'))
		document.getElementById('chord' + chordNum + 'note1').innerHTML = chord[0]
		document.getElementById('chord' + chordNum + 'note2').innerHTML = chord[1]
		document.getElementById('chord' + chordNum + 'note3').innerHTML = chord[2]
	}
	if (document.getElementById('showChordsToggle').checked) {
		document.getElementById('chords').style.display = 'none'
		document.getElementById('showfullscale').checked = true
		document.getElementById('showfullscale').style.display = 'none'
	} else {
		document.getElementById('chords').style.display = ''
		switch (mode) {
			case 1:
				displayMajor(1, 'I')
				displayMinor(2, 'ii')
				displayMinor(3, 'iii')
				displayMajor(4, 'IV')
				displayMajor(5, 'V')
				displayMinor(6, 'vi')
				displayDiminished(7, 'vii<SUP>o</SUP>')
				break
			case 2:
				displayMinor(1, 'i')
				displayMinor(2, 'ii')
				displayMajor(3, 'III')
				displayMajor(4, 'IV')
				displayMinor(5, 'v')
				displayDiminished(6, 'vi<SUP>o</SUP>')
				displayMajor(7, 'VII')
				break
			case 3:
				displayMinor(1, 'i')
				displayMajor(2, 'II')
				displayMajor(3, 'III')
				displayMinor(4, 'iv')
				displayDiminished(5, 'v<SUP>o</SUP>')
				displayMajor(6, 'VI')
				displayMinor(7, 'vii')
				break
			case 4:
				displayMajor(1, 'I')
				displayMajor(2, 'II')
				displayMinor(3, 'iii')
				displayDiminished(4, 'iv<SUP>o</SUP>')
				displayMajor(5, 'V')
				displayMinor(6, 'vi')
				displayMinor(7, 'vii')
				break
			case 5:
				displayMajor(1, 'I')
				displayMinor(2, 'ii')
				displayDiminished(3, 'iii<SUP>o</SUP>')
				displayMajor(4, 'IV')
				displayMinor(5, 'v')
				displayMinor(6, 'vi')
				displayMajor(7, 'VII')
				break
			case 6:
				displayMinor(1, 'i')
				displayDiminished(2, 'ii<SUP>o</SUP>')
				displayMajor(3, 'III')
				displayMinor(4, 'iv')
				displayMinor(5, 'v')
				displayMajor(6, 'VI')
				displayMajor(7, 'VII')
				break
			case 7:
				displayDiminished(1, 'i<SUP>o</SUP>')
				displayMajor(2, 'II')
				displayMinor(3, 'iii')
				displayMinor(4, 'iv')
				displayMajor(5, 'V')
				displayMajor(6, 'VI')
				displayMinor(7, 'vii')
				break
		}
	}
	if (tonicNote == 0) {
		document.getElementById('showfullscale').checked = true
		document.getElementById('chords').style.display = 'none'
		document.getElementById('showfullscale').style.display = 'none'
		document.getElementById('showChordsToggle').style.display = 'none'
		document.getElementById('showChordsToggleLabel').style.display = 'none'
		console.log('custom')
	} else {
		document.getElementById('showChordsToggle').style.display = ''
		document.getElementById('showChordsToggleLabel').style.display = ''
	}
}
/* NOTE CODE REF
1	Ab / G#
2	A
3	Bb / A#
4	B
5	C
6	Db / C#
7	D
8	Eb / D#
9	E
10	F
11	Gb / F#
12	G
*/
