class Node {
    constructor(value,lat,long){
        this.value = value.trim();
        this.long = long
        this.lat = lat
        this.numOfFriend = 0;
        this.friends = [];
    }
    addFriend(value, lat, long){
        if (!this.isFriend(value)){
            this.friends.push({
                value : value,
                jarak : this.getHaversine({lat : this.lat, long: this.long},{lat: lat, long: long})
            });
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
            if (this.friends[i].value == value) return i;
        }
        return -1;
    }
    getWeight(value){
        if (this.isFriend(value)){
            return this.friends[this.searchFriend(value)].jarak;
        }
        else return -1;
    }
    getHaversine(koordinat1, koordinat2){
        //KOORDINAT1 & KOORDINAT2 DALAM FROMAT
        /**
         * {
         * lat : 1.234,
         * long : 1.123 
         * }
         */
        let x1 = koordinat2.lat -koordinat1.lat
        let dLat = x1 *Math.PI /180
        let x2 = koordinat2.long -koordinat1.long
        let dLong = x2 * Math.PI/180
        let temp1 = (Math.sin(dLat/2) * Math.sin(dLat/2)) + (Math.cos(koordinat1.lat *Math.PI /180) * Math.cos(koordinat2.lat * Math.PI /180) * Math.sin(dLong/2) * Math.sin(dLong/2))
        let temp2 = 2* Math.atan2(Math.sqrt(temp1), Math.sqrt(1-temp1))
        return temp2*6371000
    }
    deleteFriend(val){
        let newf = []
        this.friends.forEach((i)=>{
            if(i.value!=val){
                newf.push(i)
            }
        })
        this.numOfFriend--;
        this.friends = newf
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
            if (this.nodes[i].value === val) return i;
        }
        return -1;
    }
    addNode(val, nodeLat, nodeLong){
        if (!this.isExist(val)){
            let newNode = new Node(val, nodeLat, nodeLong)
            this.nodes.push(newNode)
            this.numOfNodes++;
        }
    }
    addFriend(nodeId, friendId){
        if(this.isExist(nodeId) && this.isExist(friendId)){
            let i = this.searchNode(nodeId)
            let j = this.searchNode(friendId)
            this.nodes[i].addFriend(this.nodes[j].value, this.nodes[j].lat, this.nodes[j].long)
        }
    }
    getNodebyValue(val){
        return this.nodes[this.searchNode(val)];
    }
    getNodebyIndex(index){
        if(index>=0 && index<this.numOfNodes){
            return this.nodes[index]
        }
        return 0
    }
    getHeuristicArray(dest){
        let res = []
        if(this.isExist(dest)){
            let dnode = this.getNodebyValue(dest)
            this.nodes.forEach((node)=>{
                res.push(this.getHaversine({lat:node.lat,long:node.long},{lat:dnode.lat,long:dnode.long}))
            })
        }
        return res
    }
    getHaversine(koordinat1, koordinat2){
        //KOORDINAT1 & KOORDINAT2 DALAM FROMAT
        /**
         * {
         * lat : 1.234,
         * long : 1.123 
         * }
         */
        let x1 = koordinat2.lat -koordinat1.lat
        let dLat = x1 *Math.PI /180
        let x2 = koordinat2.long -koordinat1.long
        let dLong = x2 * Math.PI/180
        let temp1 = (Math.sin(dLat/2) * Math.sin(dLat/2)) + (Math.cos(koordinat1.lat *Math.PI /180) * Math.cos(koordinat2.lat * Math.PI /180) * Math.sin(dLong/2) * Math.sin(dLong/2))
        let temp2 = 2* Math.atan2(Math.sqrt(temp1), Math.sqrt(1-temp1))
        return temp2*6371000
    }
    getLineOneAnother(){
        let res = []
        for (let x=0;x<this.numOfNodes;x++){
            for(let y=1;y<this.numOfNodes ; y++){
                const n1 = this.getNodebyIndex(x)
                const n2 = this.getNodebyIndex(y)
                const dist = this.getHaversine({lat: n1.lat, long:n1.long},{lat: n2.lat, long:n2.long}).toFixed(2)
                if(n1.isFriend(n2.value)){
                    res.push({
                        'type' : 'Feature',
                        'geometry' : {
                            'type' : 'LineString',
                            'coordinates' : [
                                [n1.long, n1.lat],
                                [n2.long, n2.lat]
                            ]
                        },
                        "properties" : {
                            "title" : dist+" m"
                        }
                    })
                }
            }
        }
        return res
    }
};


