class Binary {
  constructor(number, canNormalise=true) {
    // This turns the number into a binary number. If the number is negative is a - is present and if the number is a float there is a .
    // e.g -10.5 -> -1010.1
    const binary = number.toString(2)

    this.binary = [binary.replace("-", "")] // Set this.binary into an array and remove negative sign
    this.isNegative = binary.includes("-") // Check if negative
    this.isFloat = binary.includes(".") // Checks if float
    this.number = number

    this.regular = this.binary // save default state

    if (this.isNegative) {
      this.#negate() // If the number is negative call the negate function
      this.negative = this.binary
    } else if (this.binary[0].slice(0, 1) === "1") {
      this.binary[0] = "0" + this.binary[0] // If not, add a 0 to the front of the binary string to show its positive
    }

    if (canNormalise) { // If the number is allowed to be normalised, then normalise it
      if (!this.isFloat)
        this.binary[0] += ".0"
      this.#normalise()
      this.normalised = this.binary
    }

    this.#processResult() // Format current binary into resultingBinary

    this.#testResult() // Test the result just to check if it actually works (only for floats)
  }

  #normalise() {
    const test = this.isNegative ? ["1", "0"] : ["0", "1"] // A number is normalised when the point is like so: 1.0 (for negative) or 0.1 (for positive)

    let binary = this.binary[0]
    if (binary.slice(0, 1) === "1" && !this.isNegative) // If the first character of a non-negative binary string is 1, add a 0 to normalise it correctly
      binary = "0" + binary
    else if (binary.slice(-1) === "1" && this.isNegative) // If the number is negative and its last character is 1 then add a 0 to the end to easily normalise it
      binary += "0"

    const startingDecimalPoint = binary.indexOf(".") // Get the position of the decimal point currently

    const splitBinary = binary.split(".")

    if (
      [...new Set(splitBinary[0].split(""))].toString() === [test[0]].toString() && // edge cases for 0.1 and 1.0
      [...new Set(splitBinary[1].split(""))].toString() === [test[1]].toString()
    ) { // If already normalised
      this.binary = [binary, new Binary(0, false)] // Set binary to normalised value
      return
    }

    const newDecimalPoint = binary.indexOf(test.join("")) + 1
    const exponent = startingDecimalPoint - newDecimalPoint
    const pointlessBinary = binary.replace(".", "")

    let newBinary
    let exponentBinary

    // This handles numbers less than 1 (I found the params of the functions below needed to be tweaked in order for it to work
    if (Math.abs(this.number) < 1) {
      exponentBinary = new Binary(exponent + 1, false)
      newBinary = pointlessBinary.slice(0, newDecimalPoint - 1) + "." + pointlessBinary.slice(newDecimalPoint - 1)
    } else {
      exponentBinary = new Binary(exponent, false)
      newBinary = pointlessBinary.slice(0, newDecimalPoint) + "." + pointlessBinary.slice(newDecimalPoint)
    }

    this.binary = [newBinary, exponentBinary]
    this.isFloat = true
  }

  #negate() {
    // This iterates through the binary string, and follows the rule:
    // Keep all the bits up to and including the right-most 1 then flip all the bits afterwards

    const conversionMap = { "0": "1", "1": "0" }
    let firstOneEncountered = false
    let result = []

    for (let binaryChar of this.binary[0].split("").reverse()) {
      if (firstOneEncountered === false || binaryChar === ".")
        result.push(binaryChar)

      if (firstOneEncountered === true && binaryChar !== ".")
        result.push(conversionMap[binaryChar])

      if (firstOneEncountered === false && binaryChar === "1")
        firstOneEncountered = true
    }

    // If the number is negative we add a 1 to indicate its negative
    let binary = [(this.isNegative ? "1" : "") + result.reverse().join(""), ...this.binary.slice(1)]
    if (binary[0].slice(0, 2) === "11")
      binary[0] = binary[0].slice(1)

    this.binary = binary
  }

  #processResult() {
    if (this.isFloat) { // If it's a float only keep the last character (e.g 11.0 would become 1.0 which is correct)
      const pointPosition = this.binary[0].indexOf(".")
      this.binary[0] = this.binary[0].slice(pointPosition - 1)
    }

    if (this.binary[0] === "00") // tidy up
      this.binary[0] = "0"

    if (this.isFloat)
      this.resultingBinary = [this.binary[0], this.binary[1].resultingBinary[0]] // If its a float also return the exponent
    else
      this.resultingBinary = [this.binary[0]]
  }

  #testResult() {
    // this manually works out the result to check if everything went well
    // i run it and print the result to the console for every calculation

    if (this.isFloat) {
      let sum = 0
      let negativeFirst = true

      const binary = this.resultingBinary
      const splitBinary = binary[0].split(".")
      const pointlessBinary = binary[0].replace(".", "")
      const beforePointLength = splitBinary[0].length
      const afterPointLength = splitBinary[1].length

      for (let i = beforePointLength - 1; i >= -afterPointLength - 1; i--) {
        let value = 2**i

        if (negativeFirst === true) {
          value = -value
          negativeFirst = false
        }

        if (pointlessBinary[Math.abs(i)] === "1")
          sum += value
      }

      const result = sum*(2**this.binary[1].number)

      this.isValid = result === this.number // The result has been to see that it works
    }
  }
}





// Driver Code
function generateTable(binary, desc="", firstNegative=false) {
  let decimalPointPassed = false
  const splitBinary = binary.split(".")
  const beforePointLength = (splitBinary[0] || []).length
  const afterPointLength = (splitBinary[1] || []).length

  let headingsHTML = []
  let valuesHTML = []

  let realIndex = 0

  for (let i = beforePointLength - 1; i >= -afterPointLength - 1; i--) {
    if (binary[realIndex] === ".") {
      headingsHTML.push(`<th>.</th>`)
      decimalPointPassed = true
    }

    let value = 2**Math.abs(i)

    if (firstNegative === true) {
      firstNegative = false
      value = -value
    }

    let content = (decimalPointPassed ? "1&frasl;" : "") + value

    if (binary[realIndex] !== undefined) {
      headingsHTML.push(`<th>${content}</th>`)
      valuesHTML.push(`<td>${binary[realIndex]}</td>`)
    }

    realIndex++
  }

  if (binary.includes(".")) { // If its a float
    headingsHTML.pop()
  }

  const header = desc !== "" ? `<p class="tableHeader">${desc}</p>` : ""

  return `${header}
  <table>
    <tr>
        ${headingsHTML.join("\n")}
    </tr>
    <tr>
        ${valuesHTML.join("\n")}
    </tr>
  </table>`
}

function convert() {
  const numberInput = document.querySelector("#numberInput")
  console.log(numberInput)
  const output = document.querySelector("#output")

  try {
    const number = parseFloat(numberInput.value)

    const binary = new Binary(number)

    console.log(`Generated float works?: ${binary.isValid}`)

    let stepCounter = 1

    resultingTables = [
      `<h1>Step ${stepCounter++}</h1>`,
      generateTable(binary.regular[0], "Turn denary number into positive binary")
    ]

    if (binary.isNegative) {
      resultingTables.push(`<h1>Step ${stepCounter++}</h1>`,)
      resultingTables.push(generateTable(binary.negative[0], "Turn positive binary number into two's compliment negative binary number", true))
    }

    if (binary.isFloat) {
      const mantissa = generateTable(binary.normalised[0], "", true)
      const exponent = generateTable(binary.normalised[1].resultingBinary[0], "", true)
      resultingTables.push(`<h1>Step ${stepCounter++}</h1>`,)
      resultingTables.push(`<p class="tableHeader">Normalise (Move decimal point ${Math.abs(binary.normalised[1].number)} places to the ${binary.normalised[1].number < 0 ? "right" : "left"})</p>
    <div class="inlineTables">
        ${mantissa}
        ${exponent}
    </div>`)
    }

    output.innerHTML = resultingTables.join("\n")
  } catch {}
}

function clearInput() {
  const numberInput = document.querySelector("#numberInput")
  numberInput.value = "test"
}
