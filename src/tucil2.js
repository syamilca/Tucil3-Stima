var script = document.createElement('script')
script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDOWsPALCtSWl077QszEVy8OUeg7MEoi34"
script.async = true
document.head.appendChild(script)

let dept = ""
let dest = ""
let graf = {
    getNode : function(nodename){

    },
    getJarak : function(node1, node2){

    },
    getHeuristik : function(nodeStart, nodeFinish){

    }
}
document.getElementById('inputfile').addEventListener('change', function() 
    {
        const fr=new FileReader();
        dept = ""
        dest = ""
        fr.onload=  () => bacaTxt(fr.result);
        fr.readAsText(this.files[0]);
    })

function bacaTxt(result){
    let temp = []
    temp.push.apply(temp,result.split('\n'));
    if(Number(temp[0])!=NaN && temp.length == (2*Number(temp[0]))+1){
        graf.jumlahNode = Number(temp[0])
        graf.nodes = []
        
        var i,j
        for(i=1; i<=graf.jumlahNode; i++){
            let nodeTemp = temp[i].split(" ")
            graf.nodes.push({
                lat : nodeTemp[0],
                long : nodeTemp[1],
                name : nodeTemp[2],
                adjacency : []
            })
        }
        for(i=1+graf.jumlahNode;i<=2*graf.jumlahNode;i++){
            const t = temp[i].split(' ')
            for(j=0;j<graf.jumlahNode;j++){
                if(t[j]=='1'){
                    graf.nodes[i-1-graf.jumlahNode].adjacency.push(graf.nodes[j].name)
                }
            }
        }
        setComboBox()
        muatPeta()
        //document.getElementById("output").textContent = "ACC"
    }else{
        document.getElementById("output").textContent = "ERROR"
    }
    console.log(graf)
}

function klik(){
    console.log(graf)
}

function muatPeta(){
    //console.log(graf)
    var mapprops = {
        center:new google.maps.LatLng(graf.nodes[0].lat,graf.nodes[0].long),
        zoom:15,
        mapTypeId:'roadmap'
    };
    const myMap = new google.maps.Map(document.getElementById("googleMap"),mapprops)

    var i
    for(i=0;i<graf.jumlahNode;i++){
        new google.maps.Marker({
            position : new google.maps.LatLng(graf.nodes[i].lat,graf.nodes[i].long),
            map : myMap,
            title : graf.nodes[i].name
        })
    }
}

function setComboBox(){
    let depature = '<option value="0">Select Depature Point</option>'
    let i
    for(i=0;i<graf.jumlahNode;i++){
        depature = depature + '<option value="'+ graf.nodes[i].name +'">'+ graf.nodes[i].name +'</option>'
    }
    document.getElementById("depatureNode").innerHTML = depature
}

document.getElementById("depatureNode").addEventListener("change",function(){
    if(this.value!='0'){
        dept = this.value
        dest = ""
        let destination = '<option value="0">Select Destination</option>'
        let i
        for(i=0;i<graf.jumlahNode;i++){
            if(this.value!=graf.nodes[i].name){
                destination = destination + '<option value="'+ graf.nodes[i].name +'">'+ graf.nodes[i].name +'</option>'
            }
        }
        document.getElementById("destinationNode").innerHTML = destination
    }else{
        document.getElementById("destinationNode").innerHTML = ""
    }
},false)

document.getElementById("destinationNode").addEventListener("change",function(){
    if(this.value!='0'){
        dest = this.value
    }
},false)
