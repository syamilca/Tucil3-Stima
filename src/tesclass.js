class Node {
    constructor(value){
        this.value = value;
        this.numOfFriend = 0;
        this.friends = [];
    }
    addFriend(value, weight){
        if (!this.isFriend(value)){
            this.friends.push([value, weight]);
            this.numOfFriend++;
        }
    }
    isFriend(value){
        if (this.searchFriend(value) != -1){
            return true;
        }
        else return false;
    }
    searchFriend(value){
        for (let i = 0; i < this.numOfFriend; i++){
            if (this.friends[i][0] == value) return i;
        }
        return -1;
    }
    getWeight(value){
        if (this.isFriend(value)){
            return this.friends[this.searchFriend(value)][1];
        }
        else return -1;
    }
};

class Graph {
    constructor(){
        this.nodes = [];
        this.numOfNodes = 0;
    }
    isExist(val){
        if (this.searchNode(val) != -1) return true;
        else return false;
    }
    searchNode(val){
        for (let i = 0; i < this.numOfNodes; i++){
            if (this.nodes[i].value == val) return i;
        }
        return -1;
    }
    addNode(val, friend, weight){
        if (!this.isExist(val)){
            let newNode = new Node(val);
            newNode.addFriend(friend, weight);
            this.nodes.push(newNode);
            this.numOfNodes++;
        } else {
            let idx = this.searchNode(val);
            if (!this.nodes[idx].isFriend(friend)){
                this.nodes[idx].addFriend(friend, weight);
            }
        }
        if (!this.isExist(friend)){
            let newNode = new Node(friend);
            newNode.addFriend(val, weight);
            this.nodes.push(newNode);
            this.numOfNodes++;
        } else {
            let idx = this.searchNode(friend);
            if (!this.nodes[idx].isFriend(val)){
                this.nodes[idx].addFriend(val, weight);
            }
        }
    }
    getNodebyValue(val){
        return this.nodes[this.searchNode(val)];
    }
    createAdjMatrix(){
        let adjMatrix = [];
        for(let i=0; i<this.numOfNodes; i++) {
            adjMatrix[i] = [];
        }
        for (let i = 0; i < this.numOfNodes; i++){
            for (let j = 0; j < this.numOfNodes; j++){
                if (this.nodes[i].isFriend(this.nodes[j].value)){
                    adjMatrix[i].push(1);
                } else{
                    adjMatrix[i].push(0);
                }
            }
        }
        return adjMatrix;
    }
    printInfo(){
        for (let i = 0; i < this.numOfNodes; i++){
            console.log("Node value : " + this.nodes[i].value);
            console.log("Node friends : ");
            for (let j = 0; j < this.nodes[i].numOfFriend; j++){
                console.log(this.nodes[i].friends[j][0] + ", weight : " + this.nodes[i].friends[j][1]);
            }
        }
        let nodeString = "";
        for (let i = 0; i < this.numOfNodes; i++){
            nodeString += "  " + this.nodes[i].value;
        }
        let adjacentMatrix = this.createAdjMatrix();
        console.log("Adjacent matrix : ");
        console.log(nodeString);
        for (let i = 0; i < this.numOfNodes; i++){
            console.log(this.nodes[i].value + " " + adjacentMatrix[i].join("  "));
        }
    }
    BFS(node1, node2){
        let antrian = [];
        let dikunjungi = Array(this.numOfNodes).fill(false);
        let kunjungan = [];
        var currNode;
        antrian.push(node1);
        while (antrian.length != 0 && currNode != node2){
            currNode = antrian.shift();
            kunjungan.push(currNode);
            dikunjungi[this.searchNode(currNode.value)] = true;
            let currFriend = currNode.friends;
            for (let i = 0; i < currNode.numOfFriend; i++){
                if (dikunjungi[this.searchNode(currFriend[i][0])] != true && !antrian.includes(this.getNodebyValue(currFriend[i][0]))){
                    antrian.push(this.getNodebyValue(currFriend[i][0]))
                }
            }
        }
        if (kunjungan.includes(node2)){
            //console.log(kunjungan);
            for (let i = kunjungan.length - 1; i >= 1; i--){
                //console.log(kunjungan[i]);
                if (!kunjungan[i].isFriend(kunjungan[i-1].value)){
                    //delete kunjungan[i-1];
                    for (let j = i-1; j < kunjungan.length-1; j++){
                        kunjungan[j] = kunjungan[j+1];
                    }
                    let dump = kunjungan.pop();
                }
            }
            for (let i = kunjungan.length - 1; i >= 2; i--){
                if (kunjungan[i].isFriend(kunjungan[i-2].value)){
                    let weight1 = kunjungan[i].getWeight(kunjungan[i-1].value);
                    let weight2 = kunjungan[i-1].getWeight(kunjungan[i-2].value);
                    let weight3 = kunjungan[i].getWeight(kunjungan[i-2].value);
                    if (weight1 + weight2 > weight3){
                        for (let j = i-1; j < kunjungan.length-1; j++){
                            kunjungan[j] = kunjungan[j+1];
                        }
                        let dump = kunjungan.pop();
                    }
                }
            }
            //console.log(kunjungan);
            return kunjungan;
        } else {
            let dump = [];
            return dump;
        }
    }
    countPredict(node1, node2){
        let temp = this.BFS(node1, node2);
        let sum = 0;
        for (let i = 0; i < temp.length-1; i++){
            sum += temp[i].getWeight(temp[i+1].value);
        }
        return sum;
    }
};

let Graf = new Graph();
Graf.addNode("A", "B", 3);
Graf.addNode("A", "C", 5);
Graf.addNode("A", "D", 2);
Graf.addNode("B", "C", 7);
Graf.addNode("B", "E", 2);
Graf.addNode("B", "F", 3);
Graf.addNode("C", "F", 2);
Graf.addNode("C", "G", 1);
Graf.addNode("D", "G", 3);
Graf.addNode("D", "F", 4);
Graf.addNode("E", "H", 5);
Graf.addNode("E", "F", 2);
Graf.addNode("F", "H", 1);
//console.log(Graf.nodes);
console.log(Graf.countPredict(Graf.getNodebyValue("A"), Graf.getNodebyValue("H")));
//Graf.printInfo();
