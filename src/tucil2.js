mapboxgl.accessToken = 'pk.eyJ1IjoiaGFmaWRhYmkiLCJhIjoiY2tuNXZ2N25uMDg1MjJyczlna3VndmFmNSJ9.VKoc34AfkqZ5uUUODIUBVA'
let dept = ""
let dest = ""
let myGraf = new Graph()
let directionAddedFlag = false
let myMap

function bacaTxt(result){
    let temp = []
    temp.push.apply(temp,result.split('\n'));
    if(!isNaN(temp[0]) && temp.length == (2*Number(temp[0]))+1){
        let nNode = Number(temp[0])
        
        let i
        for(i=1; i<=nNode; i++){
            let nodeTemp = temp[i].split(" ")
            myGraf.addNode(String(nodeTemp[2]),nodeTemp[0],nodeTemp[1])
        }
        for(i=1+nNode;i<=2*nNode;i++){
            const t = temp[i].split(' ')
            if(t.length!=nNode) throw "matriks ketetanggaan harus matriks persegi"
            let counter = 0
            t.forEach((isFriend)=>{
                if(isNaN(isFriend) || !(Number(isFriend)<=1 && Number(isFriend)>=0)){
                    throw "matriks should be in number 1 and 0 only"
                }
                if(Number(isFriend)==1){
                    myGraf.addFriend(myGraf.getNodebyIndex(i-1-nNode).value, myGraf.getNodebyIndex(counter).value)
                }
                counter++
            })
        }
        setComboBox()
        muatPeta2()
        //document.getElementById("output").textContent = "ACC"
    }else{
        throw "error. cek format testcase sesuai dengan readme!"
    }
    console.log(myGraf)
}

function klik(){
    if(dept===dest){
        document.getElementById("output").textContent = "tidak boleh dept==dest !"
    }else{
        try{
            haha = a_star(dept,dest)
            setDirectionOnMap(haha.rute)
            document.getElementById("output").innerHTML = haha.rute+"<br>jarak = "+haha.totalJarak
        }catch(err){
            document.getElementById("output").textContent = err
        }
    }
}

function muatPeta2(){
    myMap = new mapboxgl.Map(
        {
            container : 'googleMap',
            style: 'mapbox://styles/mapbox/streets-v9', // style URL
            center: [Number(myGraf.nodes[0].long),Number(myGraf.nodes[0].lat)], // starting position as [lng, lat]
            zoom: 14
        }
    )

    let lokasi = {
        'type' : 'FeatureCollection',
        'features' : []
    }
    for(let i =0; i<myGraf.nodes.length;i++){
        const myNode = myGraf.getNodebyIndex(i)
        lokasi.features.push(
            {
                'type': 'Feature',
                'properties': {
                'description': myNode.value,
                },
                'geometry': {
                'type': 'Point',
                'coordinates': [myNode.long, myNode.lat]
                }
            }
        )
    }

    myMap.on('load',function(){
        const mapLine = myGraf.getLineOneAnother()
        let counter = 1
        mapLine.forEach((dataKoordinat) => {
            const n = 'garis'+counter
            myMap.addSource(n, {
                'type' : 'geojson',
                'data' : dataKoordinat
            })

            myMap.addLayer({
                'id': n,
                'type': 'line',
                'source': n,
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round',
                },
                'paint': {
                    'line-color': '#888',
                    'line-width': 3
                }
            })

            myMap.addLayer({
                "id": "jarak2titik-"+counter,
                "type": "symbol",
                "source": n,
                "layout": {
                  "symbol-placement": "line-center",
                  "text-font": ["Open Sans Regular"],
                  "text-field": '{title}',
                  "text-size": 13,
                  "text-rotate": -4,
                  "symbol-spacing": 1,
                },
                "paint":{
                  "text-translate":[0,-40],
                }
              })
            counter++
        })

        myMap.addSource('directions',{
            'type' : 'geojson',
            'data' : {
                'type' : 'Feature',
                'geometry' :{
                    'type' :'LineString', 
                    'coordinates' : []
                } ,
                
            }
        })

        myMap.addLayer({
            'id': 'directions',
            'source': 'directions',
            'type': 'line',
            'paint': {
                'line-width': 4,
                'line-color': '#f013b1'
            }
        })

        myMap.addSource('places', {
            'type': 'geojson',
            'data': lokasi
            });

        myMap.addLayer({
            'id': 'poi-labels',
            'type': 'symbol',
            'source': 'places',
            'layout': {
                'text-field': ['get', 'description'],
                'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                'text-radial-offset': 0.5,
                'text-justify': 'auto',
                'icon-image': ['concat', ['get', 'icon'], '-15']
            },
            'paint' : {
                'text-color' : '#556fe0'
            }
        });
    })



}

function setComboBox(){
    let depature = '<option value="0">Select Depature Point</option>'
    let i
    for(i=0;i<myGraf.nodes.length;i++){
        depature = depature + '<option value="'+myGraf.nodes[i].value+'">'+ myGraf.nodes[i].value +'</option>'
    }
    document.getElementById("depatureNode").innerHTML = depature
}

function setDirectionOnMap(listOfPassedNodes, start, end){
    let dir = {
        'type' : 'Feature',
        'geometry' :{
            'type' :'LineString', 
            'coordinates' : []
        }
    }

    listOfPassedNodes.forEach((node)=>{
        dir.geometry.coordinates.push(
            [myGraf.getNodebyValue(node).long,myGraf.getNodebyValue(node).lat]
        )
    })
    myMap.getSource('directions').setData(dir)
}

document.getElementById("depatureNode").addEventListener("change",function(){
    document.getElementById("destinationNode").innerHTML = ""
    if(this.value!='0'){
        dept = String(this.value).replace('\n','').trim()
        dest = ""
        let destination = '<option value="0">Select Destination</option>'
        for(let i=0;i<myGraf.nodes.length;i++){
            if(dept!=(myGraf.nodes[i].value.trim())!=0){
                destination = destination + '<option value="'+myGraf.nodes[i].value+'">'+myGraf.nodes[i].value+'</option>'
            }
        }
        document.getElementById("destinationNode").innerHTML = destination
        document.getElementById("daftarHeuristik").innerHTML = ""
        document.getElementById("tujuanSaya").textContent = "-"
    }
},false)

document.getElementById("destinationNode").addEventListener("change",function(){ 
    if(this.value!='0'){
        dest = String(this.value).replace('\n','').trim()
        let tmp = ""
        const heuristikObj = myGraf.getHeuristicArray(dest)
        const listPoint = Object.keys(heuristikObj)
        listPoint.forEach((poin)=>{
            tmp = tmp + "<tr>" + "<td>" + poin+ "</td>" + "<td>" + heuristikObj[poin].toFixed(2) + "</td>" + "</tr>"
        })
        document.getElementById("daftarHeuristik").innerHTML = tmp
        document.getElementById("tujuanSaya").textContent = dest
    }
},false)

document.getElementById('inputfile').addEventListener('change', function() 
    {
        const fr=new FileReader();
        dept = ""
        dest = ""
        fr.onload=  () => {
            try{
                bacaTxt(fr.result)
            }catch(err){
                document.getElementById("output").textContent = err
            }
        };
        fr.readAsText(this.files[0]);
        
})

/**
 * 
 * @param {string} start 
 * @param {string} destination 
 */
 function a_star(start,destination){
    let heuristik = myGraf.getHeuristicArray(destination)
    if((myGraf.isExist(start)&&myGraf.isExist(destination))==false) throw "titik start/destination tidak terdefinisi"
    let rute = [start]
    let banned = []
    let fail = false

    let c = 0
    while(!fail && !rute.includes(destination)){
        let temp = a_star_helper1(rute,banned,rute[rute.length-1],heuristik)
        rute = temp.rute
        banned = temp.banned
        if(rute.length==0){
            fail = true
        }

        //PENGAMAN DARI INFINITIE LOOPING
        c++
        if(c>myGraf.numOfNodes*2){fail=true}
    }

    if(fail) throw "tidak dapat dilakukan A*"
    else return{
        'start' : start,
        'destination' : destination,
        'rute' :   rute,
        'totalJarak' : sumJarak(rute)
    }

}

/**
 * 
 * @param {Array} rute 
 * @param {Array} banned 
 * @param {string} currNode
 */
function a_star_helper1(rute, banned,currNode, heuristik){
    let cnode = myGraf.getNodebyValue(currNode)
    let candidates = []
    cnode.friends.forEach((f)=>{
        if(!(rute.includes(f.value) || banned.includes(f.value))){
            candidates.push(f)
        }
    })
    if(candidates.length>0){
        let nextNode = candidates[0]
        for(let x=1;x<candidates.length;x++){
            let cName = candidates[x].value
            let cJarak = candidates[x].jarak
            //console.log([cJarak+heuristik[cName]])
            //console.log(nextNode.jarak + heuristik[nextNode.value])
            if(cJarak + heuristik[cName] < nextNode.jarak + heuristik[nextNode.value]){
                //console.log([cJarak,heuristik[cName]])
                nextNode = candidates[x]
            }
        }
        //console.log(candidates)
        //console.log(nextNode)
        rute.push(nextNode.value)
        //console.log(rute)
        return {
            'rute' : rute,
            'banned' : banned
        }
    }else{
        rute = deleteArray(rute,rute[rute.length-1])
        banned.push(currNode)
        return{
            'rute' : rute,
            'banned' : banned
        }
    }
}

/**
 * 
 * @param {Array} oldArray 
 * @param {*} key 
 */
function deleteArray(oldArray, key){
    let newArray = []
    oldArray.forEach((i)=>{
        if(i!=key){
            newArray.push(i)
        }
    })
    return newArray
}

/**
 * 
 * @param {Array} rute 
 */
function sumJarak(rute){
    let s = 0
    for(let x=1;x<rute.length;x++){
        let pa = myGraf.getNodebyValue(rute[x])
        let pb = myGraf.getNodebyValue(rute[x-1])
        s = s + myGraf.getHaversine({lat:pa.lat , long :pa.long},{lat: pb.lat, long :pb.long})
    }
    return s
}

