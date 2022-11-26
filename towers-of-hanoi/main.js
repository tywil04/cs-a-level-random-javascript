// Drag-and-drop handling events
function dragStart(event) {
    // Set id as data that will be used when dropping the element
    event.dataTransfer.setData('text/plain', event.target.id);

     // this hackery ensures that when a draggable item is picked up its displayed alongside the users cursor and that its hidden from site on the page
    setTimeout(() => event.target.classList.add("hidden"), 0);
}

function dragEnd(event) {
    event.target.classList.remove("hidden")
}

function dragEnter(event) {
    event.preventDefault();

    if (event.target.classList.contains("tower")) {
        event.target.classList.add("active");
    }
}

function dragOver(event) {
    event.preventDefault();

    if (event.target.classList.contains("tower")) {
        event.target.classList.add("active");
    }
}

function dragLeave(event) {
    if (event.target.classList.contains("tower")) {
        event.target.classList.remove("active");
    }
}

function drop(event) {
    if (event.target.classList.contains("tower")) {
		let diskId = event.dataTransfer.getData('text/plain'); // Get id from transfered data
		let disk = document.getElementById(diskId)
		
		let children = event.target.children

        // Check if the tower has no children, or the top-most elemnt has a larger mass than the disk we want to place
		if (children.length === 0 || parseInt(children[children.length - 1].dataset.mass) > parseInt(disk.dataset.mass)) {
            event.target.appendChild(disk)	

            document.querySelector("#moves").innerText = parseInt(document.querySelector("#moves").innerText) + 1 // update moves counter  
		
            checkWin() ? message("You solved the puzzle!"): null
        // Check if the disk does not belong to the tower its dropped in
        } else if (disk.parentNode != event.target) {
            message("Invalid move!")
        }

        event.target.classList.remove("active")
    }
}

function checkWin() {
	let towers = document.querySelectorAll(".tower")
	let win = true
	
	for (let tower of towers) {
        // if any of the towers that isnt the last tower has a child, the user has not won
		if (tower.children.length !== 0 && tower != towers[towers.length - 1]) {
			win = false
		}
		
        // if the last tower has no children, the user has not won
		if (tower.children.length === 0 && tower == towers[towers.length - 1]) {
			win = false
		}
	}
	
	return win
}

function towerOfHanoi(button, n, leftTower,  middleTower, rightTower) {
    // Tower of Hanoi algorithm (https://www.geeksforgeeks.org/iterative-tower-of-hanoi/)
    //
    // 1. Calculate the total number of moves required i.e. "pow(2, n) - 1" here n is number of disks.
    // 2. If number of disks (i.e. n) is even then interchange destination 
    // pole and auxiliary pole.
    // 3. for i = 1 to total number of moves:
    //     if i%3 == 1:
    //     legal movement of top disk between source pole and 
    //         destination pole
    //     if i%3 == 2:
    //     legal movement top disk between source pole and 
    //         auxiliary pole    
    //     if i%3 == 0:
    //         legal movement top disk between auxiliary pole 
    //         and destination pole 
     
    button.disabled = true
    document.querySelector("#moves").innerText = "0" // reset moves counter
    document.querySelector("#gameButton").disabled = true // disable reset button

    if (n % 2 == 0) { // if even
        let tempTower = rightTower
        rightTower = middleTower
        middleTower = tempTower
    }

    let i = 1
    let limit = (2 ** n) - 1
    let interval = setInterval(() => { // run this function at specified intervals (this is how i wait when solving)
        if (i <= limit) {
            let topLeft = leftTower.children[leftTower.children.length - 1]
            let topMiddle = middleTower.children[middleTower.children.length - 1]
            let topRight = rightTower.children[rightTower.children.length - 1]

            let startTower
            let endTower
            let topStart
            let topEnd

            // sort out the start and end tower for next move
            let toTest = i % 3
            if (toTest === 0) {
                startTower = middleTower
                endTower = rightTower
                topStart = topMiddle
                topEnd = topRight
            } else if (toTest === 1) {
                startTower = leftTower
                endTower = rightTower
                topStart = topLeft
                topEnd = topRight
            } else if (toTest === 2) {
                startTower = leftTower
                endTower = middleTower
                topStart = topLeft
                topEnd = topMiddle
            }

            // check if the move is legal
            if (startTower.children.length === 0) {
                startTower.appendChild(topEnd)
            } else if (endTower.children.length === 0) {
                endTower.appendChild(topStart)
            } else {
                if (parseInt(topStart.dataset.mass) > parseInt(topEnd.dataset.mass)) {
                    startTower.appendChild(topEnd)
                } else {
                    endTower.appendChild(topStart)
                }
            }

            document.querySelector("#moves").innerText = parseInt(document.querySelector("#moves").innerText) + 1  

            i++
        } else {
            clearInterval(interval) // clear interval
            document.querySelector("#gameButton").disabled = false // reenable reset button
            button.disabled = false
        }
    }, 300)
}

function message(message) {
    let messageElement = document.querySelector("#message")
    messageElement.innerText = message
    setTimeout(() => messageElement.innerText = "", 60 * 20) // remove message after time
}

function gameButtonClicked(event) {
	let size = parseInt(document.querySelector("#gameSizeInput").value)
	let container = document.querySelector(".container")

    container.dataset.disks = size

	if (container.children.length === 0) {
		for (let i = 0; i < 3; i++) { // generate towers
			let tower = document.createElement("div")
			tower.classList.add("tower")
			tower.id = `tower:${i}`
			container.appendChild(tower)
			
			if (i === 0) { // generate disks in first tower
				for (let j = 0; j < size; j++) {
					let disk = document.createElement("div")
					disk.classList.add("disk")
					disk.draggable = true
					disk.innerText = size - j
					disk.dataset.mass = size - j
					disk.id = `disk:${j}`
					tower.appendChild(disk)
				}
			}
		}
		
		let diskObjects = document.querySelectorAll(".disk")
		let towerObjects = document.querySelectorAll(".tower")

		for (let diskObject of diskObjects) {
			diskObject.addEventListener("dragstart", dragStart)
			diskObject.addEventListener("dragend", dragEnd)
		}

		for (let towerObject of towerObjects) {
			towerObject.addEventListener("dragenter", dragEnter)
			towerObject.addEventListener("dragleave", dragLeave)
			towerObject.addEventListener("dragover", dragOver)
			towerObject.addEventListener("drop", drop)
		}

        let solveGame = document.querySelector("#solveGame")
        solveGame.addEventListener("click", () => towerOfHanoi(solveGame, size, ...towerObjects))
        solveGame.disabled = false

        document.querySelector("#minMoves").innerText = `Minimum number of moves: ${(2 ** size) - 1}`
        document.querySelector("#moves").innerText = "0"

		event.target.innerText = "Reset Game"
	} else {
		for (let child of container.children) {
			child.remove()
		}
		gameButtonClicked(event)
        message("Game reset!")
	}
}

document.querySelector("#gameButton").addEventListener("click", gameButtonClicked)